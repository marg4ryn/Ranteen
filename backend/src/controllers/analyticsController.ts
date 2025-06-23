import { Request, RequestHandler, Response } from "express";
import { param, query, validationResult } from "express-validator";
import Rating from "../models/Rating";
import Dish from "../models/Dish";
import Menu from "../models/Menu";
import mongoose from "mongoose";

// Helper to parse date and set to midnight UTC
const parseDateToUTC = (dateString: string): Date | null => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

// Analytics for ratings by dish
export const getDishRatingsAnalytics: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { dishId } = req.params;
  const { startDate, endDate, groupBy } = req.query;

  try {
    // Validate dish exists
    const dish = await Dish.findById(dishId);
    if (!dish) {
      res.status(404).json({ message: "Dish not found." });
      return;
    }

    let matchQuery: any = { dish: new mongoose.Types.ObjectId(dishId) };

    // Add date range filter if provided
    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) {
        const start = parseDateToUTC(startDate as string);
        if (start) matchQuery.date.$gte = start;
      }
      if (endDate) {
        const end = parseDateToUTC(endDate as string);
        if (end) {
          end.setUTCHours(23, 59, 59, 999);
          matchQuery.date.$lte = end;
        }
      }
    }

    let pipeline: any[] = [{ $match: matchQuery }];

    if (groupBy === "day") {
      // Group by day
      pipeline.push(
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$date" },
            },
            averageRating: { $avg: "$rating" },
            totalRatings: { $sum: 1 },
            ratings: { $push: "$rating" },
            date: { $first: "$date" },
          },
        },
        {
          $addFields: {
            ratingDistribution: {
              1: {
                $size: {
                  $filter: { input: "$ratings", cond: { $eq: ["$$this", 1] } },
                },
              },
              2: {
                $size: {
                  $filter: { input: "$ratings", cond: { $eq: ["$$this", 2] } },
                },
              },
              3: {
                $size: {
                  $filter: { input: "$ratings", cond: { $eq: ["$$this", 3] } },
                },
              },
              4: {
                $size: {
                  $filter: { input: "$ratings", cond: { $eq: ["$$this", 4] } },
                },
              },
              5: {
                $size: {
                  $filter: { input: "$ratings", cond: { $eq: ["$$this", 5] } },
                },
              },
            },
          },
        },
        { $sort: { date: 1 } },
        { $project: { ratings: 0 } }
      );
    } else {
      // Overall analytics
      pipeline.push(
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            totalRatings: { $sum: 1 },
            ratings: { $push: "$rating" },
            firstRating: { $min: "$date" },
            lastRating: { $max: "$date" },
          },
        },
        {
          $addFields: {
            ratingDistribution: {
              1: {
                $size: {
                  $filter: { input: "$ratings", cond: { $eq: ["$$this", 1] } },
                },
              },
              2: {
                $size: {
                  $filter: { input: "$ratings", cond: { $eq: ["$$this", 2] } },
                },
              },
              3: {
                $size: {
                  $filter: { input: "$ratings", cond: { $eq: ["$$this", 3] } },
                },
              },
              4: {
                $size: {
                  $filter: { input: "$ratings", cond: { $eq: ["$$this", 4] } },
                },
              },
              5: {
                $size: {
                  $filter: { input: "$ratings", cond: { $eq: ["$$this", 5] } },
                },
              },
            },
          },
        },
        { $project: { _id: 0, ratings: 0 } }
      );
    }

    const result = await Rating.aggregate(pipeline);

    res.status(200).json({
      dish: {
        _id: dish._id,
        name: dish.name,
        category: dish.category,
      },
      analytics: result,
    });
  } catch (error: any) {
    console.error("Error fetching dish analytics:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Analytics for ratings by day
export const getDailyRatingsAnalytics: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { date } = req.params;
  const { category } = req.query;

  try {
    const targetDate = parseDateToUTC(date);
    if (!targetDate) {
      res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD." });
      return;
    }

    // Get menu for the specified date
    const menu = await Menu.findOne({ date: targetDate }).populate("dishes");
    if (!menu) {
      res
        .status(404)
        .json({ message: "No menu found for the specified date." });
      return;
    }

    let dishIds = menu.dishes.map((dish: any) => dish._id);

    // Filter by category if specified
    if (category) {
      const filteredDishes = menu.dishes.filter(
        (dish: any) => dish.category === category
      );
      dishIds = filteredDishes.map((dish: any) => dish._id);
    }

    // Get ratings for all dishes on this date
    const pipeline: any[] = [
      {
        $match: {
          date: targetDate,
          dish: { $in: dishIds },
        },
      },
      {
        $lookup: {
          from: "dishes",
          localField: "dish",
          foreignField: "_id",
          as: "dishInfo",
        },
      },
      { $unwind: "$dishInfo" },
      {
        $group: {
          _id: "$dish",
          dishName: { $first: "$dishInfo.name" },
          dishCategory: { $first: "$dishInfo.category" },
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
          ratings: { $push: "$rating" },
        },
      },
      {
        $addFields: {
          ratingDistribution: {
            1: {
              $size: {
                $filter: { input: "$ratings", cond: { $eq: ["$$this", 1] } },
              },
            },
            2: {
              $size: {
                $filter: { input: "$ratings", cond: { $eq: ["$$this", 2] } },
              },
            },
            3: {
              $size: {
                $filter: { input: "$ratings", cond: { $eq: ["$$this", 3] } },
              },
            },
            4: {
              $size: {
                $filter: { input: "$ratings", cond: { $eq: ["$$this", 4] } },
              },
            },
            5: {
              $size: {
                $filter: { input: "$ratings", cond: { $eq: ["$$this", 5] } },
              },
            },
          },
        },
      },
      { $sort: { averageRating: -1 } },
      { $project: { ratings: 0 } },
    ];

    const dishAnalytics = await Rating.aggregate(pipeline);

    // Overall daily statistics
    const overallPipeline: any[] = [
      {
        $match: {
          date: targetDate,
          dish: { $in: dishIds },
        },
      },
      {
        $group: {
          _id: null,
          totalRatings: { $sum: 1 },
          averageRating: { $avg: "$rating" },
          uniqueStudents: { $addToSet: "$student" },
          ratings: { $push: "$rating" },
        },
      },
      {
        $addFields: {
          uniqueStudentsCount: { $size: "$uniqueStudents" },
          ratingDistribution: {
            1: {
              $size: {
                $filter: { input: "$ratings", cond: { $eq: ["$$this", 1] } },
              },
            },
            2: {
              $size: {
                $filter: { input: "$ratings", cond: { $eq: ["$$this", 2] } },
              },
            },
            3: {
              $size: {
                $filter: { input: "$ratings", cond: { $eq: ["$$this", 3] } },
              },
            },
            4: {
              $size: {
                $filter: { input: "$ratings", cond: { $eq: ["$$this", 4] } },
              },
            },
            5: {
              $size: {
                $filter: { input: "$ratings", cond: { $eq: ["$$this", 5] } },
              },
            },
          },
        },
      },
      { $project: { _id: 0, uniqueStudents: 0, ratings: 0 } },
    ];

    const overallStats = await Rating.aggregate(overallPipeline);

    res.status(200).json({
      date: targetDate.toISOString().split("T")[0],
      menu: {
        _id: menu._id,
        totalDishes: menu.dishes.length,
        filteredDishes: dishIds.length,
      },
      overallStats: overallStats[0] || {
        totalRatings: 0,
        averageRating: 0,
        uniqueStudentsCount: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      },
      dishAnalytics,
    });
  } catch (error: any) {
    console.error("Error fetching daily analytics:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get trending dishes (top rated dishes in a period)
export const getTrendingDishes: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { startDate, endDate, limit = 10, category } = req.query;

  try {
    let matchQuery: any = {};

    // Add date range filter
    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) {
        const start = parseDateToUTC(startDate as string);
        if (start) matchQuery.date.$gte = start;
      }
      if (endDate) {
        const end = parseDateToUTC(endDate as string);
        if (end) {
          end.setUTCHours(23, 59, 59, 999);
          matchQuery.date.$lte = end;
        }
      }
    }

    const pipeline: any[] = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "dishes",
          localField: "dish",
          foreignField: "_id",
          as: "dishInfo",
        },
      },
      { $unwind: "$dishInfo" },
    ];

    // Filter by category if specified
    if (category) {
      pipeline.push({
        $match: { "dishInfo.category": category },
      });
    }

    pipeline.push(
      {
        $group: {
          _id: "$dish",
          dishName: { $first: "$dishInfo.name" },
          dishCategory: { $first: "$dishInfo.category" },
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
          ratings: { $push: "$rating" },
        },
      },
      {
        $match: {
          totalRatings: { $gte: 3 }, // Only dishes with at least 3 ratings
        },
      },
      {
        $addFields: {
          ratingDistribution: {
            1: {
              $size: {
                $filter: { input: "$ratings", cond: { $eq: ["$$this", 1] } },
              },
            },
            2: {
              $size: {
                $filter: { input: "$ratings", cond: { $eq: ["$$this", 2] } },
              },
            },
            3: {
              $size: {
                $filter: { input: "$ratings", cond: { $eq: ["$$this", 3] } },
              },
            },
            4: {
              $size: {
                $filter: { input: "$ratings", cond: { $eq: ["$$this", 4] } },
              },
            },
            5: {
              $size: {
                $filter: { input: "$ratings", cond: { $eq: ["$$this", 5] } },
              },
            },
          },
        },
      },
      { $sort: { averageRating: -1, totalRatings: -1 } },
      { $limit: parseInt(limit as string) },
      { $project: { ratings: 0 } }
    );

    const trendingDishes = await Rating.aggregate(pipeline);

    res.status(200).json({
      period: {
        startDate: startDate || "All time",
        endDate: endDate || "All time",
      },
      category: category || "All categories",
      trendingDishes,
    });
  } catch (error: any) {
    console.error("Error fetching trending dishes:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get rating statistics overview
export const getRatingStatistics: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { startDate, endDate } = req.query;

  try {
    let matchQuery: any = {};

    // Add date range filter
    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) {
        const start = parseDateToUTC(startDate as string);
        if (start) matchQuery.date.$gte = start;
      }
      if (endDate) {
        const end = parseDateToUTC(endDate as string);
        if (end) {
          end.setUTCHours(23, 59, 59, 999);
          matchQuery.date.$lte = end;
        }
      }
    }

    const pipeline: any[] = [
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalRatings: { $sum: 1 },
          averageRating: { $avg: "$rating" },
          uniqueStudents: { $addToSet: "$student" },
          uniqueDishes: { $addToSet: "$dish" },
          ratings: { $push: "$rating" },
          firstRating: { $min: "$date" },
          lastRating: { $max: "$date" },
        },
      },
      {
        $addFields: {
          uniqueStudentsCount: { $size: "$uniqueStudents" },
          uniqueDishesCount: { $size: "$uniqueDishes" },
          ratingDistribution: {
            1: {
              $size: {
                $filter: { input: "$ratings", cond: { $eq: ["$$this", 1] } },
              },
            },
            2: {
              $size: {
                $filter: { input: "$ratings", cond: { $eq: ["$$this", 2] } },
              },
            },
            3: {
              $size: {
                $filter: { input: "$ratings", cond: { $eq: ["$$this", 3] } },
              },
            },
            4: {
              $size: {
                $filter: { input: "$ratings", cond: { $eq: ["$$this", 4] } },
              },
            },
            5: {
              $size: {
                $filter: { input: "$ratings", cond: { $eq: ["$$this", 5] } },
              },
            },
          },
        },
      },
      { $project: { _id: 0, uniqueStudents: 0, uniqueDishes: 0, ratings: 0 } },
    ];

    const statistics = await Rating.aggregate(pipeline);

    // Get daily rating trends
    const dailyTrendsPipeline: any[] = [
      { $match: matchQuery },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" },
          },
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
          date: { $first: "$date" },
        },
      },
      { $sort: { date: 1 } },
    ];

    const dailyTrends = await Rating.aggregate(dailyTrendsPipeline);

    res.status(200).json({
      period: {
        startDate: startDate || "All time",
        endDate: endDate || "All time",
      },
      statistics: statistics[0] || {
        totalRatings: 0,
        averageRating: 0,
        uniqueStudentsCount: 0,
        uniqueDishesCount: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        firstRating: null,
        lastRating: null,
      },
      dailyTrends,
    });
  } catch (error: any) {
    console.error("Error fetching rating statistics:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Validation rules
export const dishAnalyticsValidationRules = [
  param("dishId").isMongoId().withMessage("Valid Dish ID is required."),
];

export const dailyAnalyticsValidationRules = [
  param("date")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Date must be in YYYY-MM-DD format."),
];
