import _ = require('lodash');
export async function saveAuditLog(action, model, options) {
  // await SequelizeAuditTrailModel.create({
  //   userId: model.dataValues.createdById || options.authUserId,
  //   actionType: action,
  //   table: model._modelOptions.name.plural,
  //   prevValues: JSON.stringify(_.pick(model._previousDataValues, model._options.attributes)),
  //   newValues: JSON.stringify(_.pick(model.dataValues, model._options.attributes)),
  // });
}