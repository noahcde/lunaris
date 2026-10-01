// Abonnement Stripe : 6,99 €/mois ou 49,99 €/an, 2 jours offerts une seule fois (carte requise).
// L'état de l'abonnement est lu directement chez Stripe, puis gardé 15 minutes dans billing/{uid}
// (collection inaccessible depuis l'app : seul ce code serveur la lit et l'écrit).
import Stripe from 'stripe'
import { getFirestore } from 'firebase-admin/firestore'

export const TRIAL_DAYS = 2
const PRODUCT_NAME = 'Aligned Premium'
const PLANS = {
  monthly: { lookupKey: 'aligned_premium_monthly', amount: 699, interval: 'month', label: 'mensuel' },
  yearly: { lookupKey: 'aligned_premium_yearly', amount: 4999, interval: 'year', label: 'annuel' },
}
const ACTIVE_STATUSES = new Set(['active', 'trialing'])
const CACHE_MS = 15 * 60 * 1000

let stripe = null
const getStripe = () => (stripe ??= new Stripe(process.env.STRIPE_SECRET_KEY))
const billingRef = (uid) => getFirestore().doc(`billing/${uid}`)

export const isPlan = (plan) => Object.hasOwn(PLANS, plan)

// Les deux tarifs sont créés automatiquement chez Stripe au premier achat, puis retrouvés par leur clé.
async function priceId(plan) {
  const { lookupKey, amount, interval, label } = PLANS[plan]
  const found = await getStripe().prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 })
  if (found.data[0]) return found.data[0].id
  const price = await getStripe().prices.create({
    currency: 'eur',
    unit_amount: amount,
    recurring: { interval },
    lookup_key: lookupKey,
    transfer_lookup_key: true,
    product_data: { name: `${PRODUCT_NAME} (${label})` },
  })
  return price.id
}

async function customerId(uid, email) {
  const snap = await billingRef(uid).get()
  if (snap.get('customerId')) return snap.get('customerId')
  const customer = await getStripe().customers.create(
    { email: email ?? undefined, metadata: { uid } },
    { idempotencyKey: `customer-${uid}` },
  )
  await billingRef(uid).set({ customerId: customer.id }, { merge: true })
  return customer.id
}

const planOf = (sub) => {
  const price = sub.items.data[0]?.price
  if (price?.lookup_key === PLANS.monthly.lookupKey) return 'monthly'
  if (price?.lookup_key === PLANS.yearly.lookupKey) return 'yearly'
  return price?.recurring?.interval === 'year' ? 'yearly' : 'monthly'
}

async function fetchState(customer) {
  const subs = await getStripe().subscriptions.list({ customer, status: 'all', limit: 20 })
  const current = subs.data.find((s) => ACTIVE_STATUSES.has(s.status))
  return {
    active: Boolean(current),
    status: current?.status ?? null,
    plan: current ? planOf(current) : null,
    trialEnd: current?.status === 'trialing' ? current.trial_end : null,
    periodEnd: current?.items.data[0]?.current_period_end ?? null,
    cancelAtPeriodEnd: current?.cancel_at_period_end ?? false,
    // Un seul essai par compte : tout abonnement passé, même résilié, le consomme.
    trialUsed: subs.data.length > 0,
    hasCustomer: true,
  }
}

const NO_SUBSCRIPTION = {
  active: false,
  status: null,
  plan: null,
  trialEnd: null,
  periodEnd: null,
  cancelAtPeriodEnd: false,
  trialUsed: false,
  hasCustomer: false,
}

export async function getBillingState(uid, { refresh = false } = {}) {
  const snap = await billingRef(uid).get()
  const customer = snap.get('customerId')
  if (!customer) return NO_SUBSCRIPTION

  const cached = snap.get('state')
  const fresh = cached && Date.now() - snap.get('checkedAt') < CACHE_MS
  if (fresh && !refresh) return cached

  try {
    const state = await fetchState(customer)
    await billingRef(uid).set({ state, checkedAt: Date.now() }, { merge: true })
    return state
  } catch (err) {
    // Stripe injoignable : on garde le dernier état connu plutôt que de bloquer l'abonné.
    if (cached) return cached
    throw err
  }
}

export async function createCheckout({ uid, email, plan, origin }) {
  const state = await getBillingState(uid, { refresh: true })
  if (state.active) return { alreadyActive: true }

  const session = await getStripe().checkout.sessions.create({
    mode: 'subscription',
    customer: await customerId(uid, email),
    client_reference_id: uid,
    line_items: [{ price: await priceId(plan), quantity: 1 }],
    // La carte est demandée même pendant l'essai ; aucun débit avant la fin des 2 jours.
    payment_method_collection: 'always',
    subscription_data: {
      metadata: { uid },
      ...(state.trialUsed ? {} : { trial_period_days: TRIAL_DAYS }),
    },
    locale: 'fr',
    success_url: `${origin}/?abonnement=ok#accueil`,
    cancel_url: `${origin}/#accueil`,
  })
  return { url: session.url }
}

export async function createPortal({ uid, origin }) {
  const customer = (await billingRef(uid).get()).get('customerId')
  if (!customer) return { url: null }
  const session = await getStripe().billingPortal.sessions.create({ customer, return_url: `${origin}/?abonnement=maj#accueil` })
  return { url: session.url }
}
