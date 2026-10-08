-- Apply after all duplicate usernames have been reviewed and repaired.
ALTER TABLE users
    ADD UNIQUE KEY ux_users_username (username);
