ARG BASE_IMAGE=debian
FROM $BASE_IMAGE

USER root

#{containerEnv}

COPY apply-scripts-cache /tmp/apply-scripts-cache

#{DoApplyScripts}

ARG IMAGE_USER=root
USER $IMAGE_USER