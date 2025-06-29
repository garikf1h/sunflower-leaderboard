import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize'
import { sequelize } from '../config'
import { User } from './user'

export class UserScore extends Model<InferAttributes<UserScore>, InferCreationAttributes<UserScore>> {
  declare userId: string
  declare totalScore: number
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

UserScore.init(
  {
    userId: {
      type: DataTypes.UUID,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    totalScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'user_scores',
    timestamps: true,
    indexes: [
      {
        name: 'idx_user_scores_score_desc',
        fields: [
          { name: 'totalScore', order: 'DESC' },
          { name: 'userId', order: 'ASC' },
        ],
      },
    ],
  }
)




UserScore.belongsTo(User, {
  foreignKey: 'userId'
})

User.hasOne(UserScore, {
  foreignKey: 'userId'
})