export default async function handler(req, res) {
   if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
   }

   try {
      const response = await fetch("https://gate.lava.top/api/v3/invoice", {
         method: "POST",
         headers: {
            Accept: "application/json",
            "X-Api-Key": process.env.LAVA_API_KEY,
            "Content-Type": "application/json",
         },
         body: JSON.stringify({
            email: "guest" + Date.now() + "@mytimenow.pro",
            offerId: "f3758089-2777-4559-a316-73a48e27996d",
            currency: "RUB",
            successful_return_url: "https://mytimenow.pro/?success",
         }),
      });

      const data = await response.json();
      res.status(response.status).json(data);
   } catch (error) {
      res.status(500).json({ error: "Payment request failed" });
   }
}
