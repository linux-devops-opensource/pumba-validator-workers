FROM registry.redhat.io/rhel7:7.9

WORKDIR /software/
COPY rhel-7-server-pys.repo /etc/yum.repos.d/
COPY security ./security/
RUN curl -sL https://py.nodesource.com/setup_14.x | bash - && \
    yum install -y nodejs-14.15.3 --disablerepo=* --enablerepo=nodesource && \
    yum install -y file --disablerepo=* --enablerepo=rhel-7-server-pys-pumba && \
    yum clean all --enablerepo=* && \
    mkdir ./pys4test
COPY package.json .
RUN npm i
COPY . .

CMD [ "node", "index.js" ]