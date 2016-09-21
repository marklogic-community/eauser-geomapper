

function EmailReporter(recipient) {
  this.recipient = recipient;
}

EmailReporter.prototype.send(subject, content) {
  xdmp.email({
    'from': { 'name': this.recipient.name, 'address': this.recipient.address },
    'to': { 'name': this.recipient.name, 'address': this.recipient.address },
    'subject': subject,
    'content': content
  });
}

module.exports = {
  makeReporter: function(recipient) {
    return new EmailReporter(recipient);
  }
};
