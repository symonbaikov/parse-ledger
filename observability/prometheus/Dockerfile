FROM prom/prometheus:v2.50.1

COPY observability/prometheus.railway.yml /etc/prometheus/prometheus.yml

CMD ["--config.file=/etc/prometheus/prometheus.yml","--config.expand-env","--storage.tsdb.path=/prometheus"]
