# EC2 Deployment Config

Use these files as templates on the Ubuntu EC2 instance.

1. Copy `backend.env.example` to `/etc/team1/backend.env` and fill real values.
2. Copy `ai.env.example` to `/etc/team1/ai.env` and fill real values.
3. Copy `nginx-team1.conf.example` to `/etc/nginx/sites-available/team1`, replace `EC2_PUBLIC_IP`, then enable it.
4. Because this repository ignores `application*.properties`, copy `application.properties.example` and `application-prod.properties.example` into `src/main/resources/` as `application.properties` and `application-prod.properties` during Jenkins build or before packaging.

The React build defaults to same-origin proxy paths:

- Spring API: `/api`
- AI API: `/ai-api`

Some existing pages still call Spring root paths such as `/calendar`, `/attendance`, `/leave`, and `/test`, so the Nginx example proxies those paths too.
