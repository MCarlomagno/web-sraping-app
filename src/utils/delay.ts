// delay function useful for async/await
export async function delay(ms: number) {
    return await new Promise(resolve => setTimeout(resolve, ms));
}