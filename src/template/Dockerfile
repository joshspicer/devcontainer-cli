#{baseFrom}

#{baseBody}

# -------------- #
FROM base

USER root

#{buildArgs}

COPY apply-scripts-cache /tmp/apply-scripts-cache
COPY do-apply.sh /tmp/do-apply.sh

RUN chmod +x /tmp/do-apply.sh \
    && /tmp/do-apply.sh

ARG IMAGE_USER=root
USER $IMAGE_USER