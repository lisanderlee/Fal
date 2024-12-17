import * as fal from "@fal-ai/serverless-client";


interface RequestBody {
    prompt: string;
    imageSize: string;
    steps: number;
    guidance: number;
  }

export async function POST(request: Request) {
  try {
    const { prompt, imageSize, steps, guidance } = await request.json() as RequestBody;

    fal.config({
      credentials: process.env.FAL_KEY!,
    });

    const result = await fal.run('fal-ai/flux/dev', {
        input: {
          prompt: prompt,
          image_size: {
            width: parseInt(imageSize.split('x')[0]),
            height: parseInt(imageSize.split('x')[1])
          },
          num_inference_steps: steps,
          guidance_scale: guidance,
        },
      });

    return Response.json(result);
  } catch (error) {
    console.error("Generation error:", error);
    return Response.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
