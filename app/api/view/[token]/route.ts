import { fail } from "@/lib/api/response";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  await params;
  return fail("구현 예정", 501);
}
