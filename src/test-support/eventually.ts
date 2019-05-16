export default async function eventually(assert: () => void) {
  let error: any;

  for (let i = 0; i < 10; i++) {
    try {
      assert();
      return;
    } catch (e) {
      error = e;
      await new Promise(resolve => setTimeout(resolve, i));
    }
  }

  throw new Error(error.message);
}
