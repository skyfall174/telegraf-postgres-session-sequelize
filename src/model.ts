import { TEXT } from 'sequelize/types/index'
import { Model, ModelCtor, Optional, Sequelize } from 'sequelize'

export interface ModelSettings {
  tableName: string
}

export interface SessionModelField {
  id: string
  data: string
}

export interface SessionCreationAttributes extends Optional<SessionModelField, 'id'> {
}

export interface SessionModel
  extends Model<SessionModelField, SessionCreationAttributes>,
    SessionModelField {
}

export function getSessionTable(
  sequelize: Sequelize,
  props: ModelSettings = { tableName: 'telegraf-session' }
): ModelCtor<SessionModel> {
  return sequelize.define<SessionModel>(
    'SessionModel',
    {
      id: {
        type: TEXT,
        allowNull: false,
        unique: true,
        primaryKey: true
      },
      data: {
        type: TEXT
      }
    },
    {
      // Other model options go here
      tableName: props.tableName,
      timestamps: false
    }
  )
}
