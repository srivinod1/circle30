export async function GET() {
    const apiKey = process.env.NEXT_PUBLIC_TOMTOM_API_KEY;
  
    const style = {
      version: 8,
      sources: {
        tomtom: {
          type: "vector",
          tiles: [
            `https://api.tomtom.com/maps/orbis/map-display/tile/{z}/{x}/{y}.pbf?apiVersion=1&key=${apiKey}&view=Unified`
          ],
          minzoom: 0,
          maxzoom: 22
        }
      },
      layers: [
        {
          id: "road-layer",
          type: "line",
          source: "tomtom",
          "source-layer": "roads", // You might need to inspect this layer name
          paint: {
            "line-color": "#ff0000",
            "line-width": 2
          }
        }
      ]
    };
  
    return Response.json(style);
  }
  