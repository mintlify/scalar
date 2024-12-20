import BaseValidationError from './base.js'

export default class RequiredValidationError extends BaseValidationError {
  constructor(...args) {
    super(...args)
    this.name = 'RequiredValidationError'
  }

  getError() {
    const { message } = this.options

    return {
      message: `${message}`,
      path: this.instancePath,
    }
  }
}
