/**
 * Test temporaire pour vérifier que GitHub Actions bloque bien
 * quand la CI échoue. À supprimer après validation.
 */
describe("CI failure check (temporary)", () => {
  it("should fail on purpose to verify GitHub Actions detection", () => {
    expect(true).toBe(false);
  });
});
