import { Request, Response, NextFunction } from 'express'
import { User, UserScore } from '../models'
import { Op } from 'sequelize'
import { APIError } from '../utils'
import { redis, REDIS_KEY, sequelize } from '../config'
import Sequelize from 'sequelize'


export const getTopUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.query.topN || typeof req.query.topN !== 'string') {
      throw new APIError('Invalid or missing "totalScore"', 400)
    }
    const topN = req.query.topN ? parseInt(req.query.topN) : 10
    let results = []
    try {
      const raw = await redis.zrange(REDIS_KEY, 0, topN - 1, 'REV', 'WITHSCORES')
      if (raw.length < 0) {
        throw new Error('no results')
      }

      for (let i = 0; i < raw.length; i += 2) {
        results.push({
          rank: i / 2 + 1,
          userId: raw[i],
          totalScore: parseInt(raw[i + 1], 10),
        })
      }
    } catch (err: any) {
      // DB fallback
      console.error(`going to fallback due to redis error: ${err.message}`)
      const topUsers = await UserScore.findAll({
        order: [['totalScore', 'DESC']],
        limit: topN
      })
      results = topUsers.map((entry, index) => ({
        rank: index + 1,
        userId: entry.userId,
        totalScore: entry.totalScore,
      }))
    }

    res.json({ data: results })
  } catch (error) {
    next(error)
  }
}

export const getUserAndSurroundingScore = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.id
    let results = []
    try {
      const rank = await redis.zrevrank(REDIS_KEY, userId)

      if (rank === null) {
        throw new Error('User not found in redis')
      }

      const start = Math.max(0, rank - 5)
      const end = rank + 5

      // Fetch surrounding users (descending order)
      const raw = await redis.zrange(REDIS_KEY, start, end, 'REV', 'WITHSCORES')


      for (let i = 0; i < raw.length; i += 2) {
        const id = raw[i]
        const score = parseInt(raw[i + 1], 10)

        const currentRank = start + i / 2 + 1 // 1-based rank
        results.push({
          rank: currentRank,
          userId: id,
          totalScore: score
        })
      }
    } catch (err: any) {
      // DB fallback
      console.error(`going to fallback due to redis error: ${err.message}`)
      results = await sequelize.query(
        `
            WITH ranked AS (
              SELECT 
                "userId",
                "totalScore",
                RANK() OVER (ORDER BY "totalScore" DESC, "userId" ASC) AS rank
              FROM "user_scores"
            )
            SELECT *
            FROM ranked
            WHERE rank BETWEEN (
                SELECT rank FROM ranked WHERE "userId" = :userId
            ) - 5 AND (
                SELECT rank FROM ranked WHERE "userId" = :userId
            ) + 5
            ORDER BY rank ASC
      `,
        {
          type: Sequelize.QueryTypes.SELECT,
          replacements: { userId },
        }
      )


      if (!results.length) {
        throw new APIError('User not found or has no score', 404)
      }
    }



    res.json({ data: results })
  } catch (error) {
    next(error)
  }
}