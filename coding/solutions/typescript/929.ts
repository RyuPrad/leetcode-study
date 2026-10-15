function numUniqueEmails(emails: string[]): number {
  const unique = new Set<string>();
  for (const email of emails) {
    const [local, domain] = email.split('@');
    const name = local.split('+')[0].replaceAll('.', '');
    unique.add(name + '@' + domain);
  }
  return unique.size;
}
