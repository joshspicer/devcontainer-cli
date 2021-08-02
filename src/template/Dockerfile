ARG BASE_IMG
FROM BASE_IMG

USER root

#{containerEnvs}

COPY apply-scripts-cache /tmp/apply-scripts-cache
COPY do-apply.sh /tmp/do-apply.sh

RUN do-apply.sh

ARG IMAGE_USER=root
USER $IMAGE_USER