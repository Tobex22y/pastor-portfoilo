# Official lightweight PHP Apache image
FROM php:8.2-apache

# Set working directory
WORKDIR /var/www/html

# Enable Apache rewrite module
RUN a2enmod rewrite

# Copy all project files into Apache web root
COPY . /var/www/html/

# Create and grant permissions for data directory so orders.csv can be written
RUN mkdir -p /var/www/html/data && \
    chown -R www-data:www-data /var/www/html && \
    chmod -R 755 /var/www/html && \
    chmod -R 775 /var/www/html/data

# Startup script to dynamically bind Apache to Render's $PORT environment variable
RUN echo '#!/bin/sh\n\
PORT="${PORT:-80}"\n\
sed -i "s/Listen 80/Listen ${PORT}/" /etc/apache2/ports.conf\n\
sed -i "s/:80/:${PORT}/" /etc/apache2/sites-available/000-default.conf\n\
exec apache2-foreground' > /usr/local/bin/entrypoint.sh && \
    chmod +x /usr/local/bin/entrypoint.sh

# Render dynamically sets PORT
EXPOSE 80 10000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
