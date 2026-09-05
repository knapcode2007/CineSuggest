import { Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { computeRecommendations } from "../services/recommendationEngine.js";

export const recommendationController = {
  async getRecommendations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const data = await computeRecommendations(userId);
      res.json({
        success: true,
        data
      });
    } catch (err: any) {
      console.error("[Recommendations] error:", err);
      res.status(500).json({ success: false, message: "Unable to generate recommendations." });
    }
  }
};
