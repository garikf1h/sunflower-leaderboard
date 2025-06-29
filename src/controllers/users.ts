import { Request, Response, NextFunction } from 'express'
import { User, UserScore } from '../models'
import { Op } from 'sequelize'
import { APIError } from '../utils'
import { redis, REDIS_KEY, sequelize } from '../config'


export const addUserWithScore = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction()
  try {
    const { name, totalScore } = req.body

    if (typeof name !== 'string') {
      throw new APIError('Invalid or missing "name"', 400)
    }

    if (
      typeof totalScore !== 'number' ||
      totalScore < 0
    ) {
      throw new APIError('Invalid or missing "totalScore"', 400)
    }

    // transaction.. they are dependenant 
    const user = await User.create({ name }, { transaction: t })
    await UserScore.create({ userId: user.id, totalScore }, { transaction: t })
    await t.commit()
    await redis.zadd(REDIS_KEY, totalScore, user.id)
    res.status(201).json({ message: 'User created', userId: user.id })
  } catch (error) {
    await t.rollback()
    next(error)
  }
}

export const updateUserScore = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { totalScore } = req.body
    if (typeof totalScore !== 'number') {
      throw new APIError('totalScore must be a number', 400)
    }
    const userScore = await UserScore.findByPk(id)
    if (!userScore) {
      throw new APIError('user was not found', 404)
    }
    userScore.totalScore = totalScore
    await userScore.save()
    await redis.zadd(REDIS_KEY, totalScore, id)
    res.status(204).end()
  } catch (error) {
    next(error)
  }
}