# Deployment remediation
The old deployment workflow contained a database password and a fixed admin password. The old Django signing key was predictable. These are still present in Git history: deleting source lines is not credential rotation.

Before deploying this branch:
1. Rotate the PostgreSQL password on the server and update the private `.env`. Prefer a least-privilege app database user.
2. Reset the existing Django administrator password with `python manage.py changepassword <username>`; remove unused accounts.
3. Generate a new SECRET_KEY, set it in `.env`, and require users to log in again. Existing JWTs/signatures must not be trusted after rotation.
4. Configure payment, database, OAuth, email and allowed-origin environment variables. Do not commit `.env` or paste credentials into logs.
5. Enable the GitHub `production` environment protection you require. Deploy is manual and depends on successful tests/build. The workflow no longer resets passwords, creates an admin, rewrites `.env` or changes product data.
6. Review and purge previously committed logs/history as appropriate only after rotation. Rewriting shared Git history needs coordination; this patch does not do so.

Checkout currently rechecks inventory when payment is captured. A captured payment that can no longer be fulfilled is marked `review`, never silently shipped; the merchant must reconcile/refund it. This demo has no automatic refund or payment webhook worker. Review pending payments against the gateway before using it for real customers.
