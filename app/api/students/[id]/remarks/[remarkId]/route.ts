import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, handleError } from "@/lib/api-helpers";

export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      remarkId: string;
    }>;
  },
) {
  try {
    const { remarkId } = await params;

    await prisma.studentRemark.delete({
      where: {
        id: remarkId,
      },
    });

    return ok(null, "Remark deleted successfully");
  } catch (error) {
    return handleError(error);
  }
}
