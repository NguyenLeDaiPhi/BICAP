-- Apply only after duplicate accounts have been reviewed and repaired.
-- Apply email uniqueness independently of legacy duplicate usernames.
ALTER TABLE users
    ADD UNIQUE KEY ux_users_email (email);
