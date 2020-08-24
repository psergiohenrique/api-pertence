import * as Yup from 'yup';

import ServerError from '../../utils/ServerError';
import UserService from '../services/UserService';

/**
 * Controller to perform authentication or create users.
 */
class SessionController {
  /**
   * Performs login for users.
   *
   * @param {Request} req the request object
   * @param {Response} res the response object
   * @returns a promise that resolves to void after the response is sent
   */
  async userLogin(req, res) {
    const valid = await Yup.object()
      .shape({
        email: Yup.string()
          .email()
          .required(),
        password: Yup.string().required(),
      })
      .isValid(req.body);

    if (!valid) {
      throw new ServerError('Erro de validação', 400, 'warn');
    }

    const { email, password } = req.body;

    const response = await UserService.driverLogin(email, password);
    return res.json(response);
  }

  /**
   * Refreshes a user token.
   *
   * @param {Request} req the request object
   * @param {Response} res the response object
   * @returns a promise that resolves to void after the response is sent
   */
  async refreshToken(req, res) {
    return res.json(await UserService.refreshToken(req.userId));
  }

  /**
   * Creates a new user. Already returns the JWT token for authenticating.
   *
   * @param {Request} req the request object
   * @param {Response} res the response object
   * @returns a promise that resolves to void after the response is sent
   */
  async userSignup(req, res) {
    const valid = await Yup.object()
      .shape({
        email: Yup.string()
          .email()
          .required(),
        password: Yup.string()
          .matches(/^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/)
          .required(),
        name: Yup.string().required(),
        phone: Yup.string()
          .matches(/\d{10,11}/)
          .required(),
      })
      .isValid(req.body);

    if (!valid) {
      throw new ServerError('Erro de validação', 400, 'warn');
    }

    const { email, password, name, phone } = req.body;

    const response = await UserService.driverSignup(email, password, name, phone);
    return res.status(201).json(response);
  }

  /**
   * Changes a user password.
   *
   * @param {Request} req the request object
   * @param {Response} res the response object
   * @returns a promise that resolves to void after the response is sent
   */
  async updateUserPassword(req, res) {
    const valid = await Yup.object()
      .shape({
        name: Yup.string()
          .min(5)
          .required(),
        currentPassword: Yup.string()
          .transform(value => (!value ? null : value))
          .nullable(),
        newPassword: Yup.string()
          .transform(value => (!value ? null : value))
          .matches(/^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/)
          .nullable(),
      })
      .isValid(req.body);

    if (!valid) {
      throw new ServerError('Erro de validação', 400, 'warn');
    }

    const user = await UserService.updateUser(req.userId, req.body.name, req.body.currentPassword, req.body.newPassword);

    const response = {
      user: {
        id: user.id,
        name: user.name,
        cpf: user.cpf,
        authority: user.authority,
        email: user.email,
        verified: user.verified,
        phone: user.phone,
      },
    };

    return res.status(202).json(response);
  }

  /**
   * Request a user password reset.
   *
   * @param {Request} req the request object
   * @param {Response} res the response object
   * @returns a promise that resolves to void after the response is sent, response body is empty
   */
  async resetPasswordRequest(req, res) {
    const valid = await Yup.object()
      .shape({
        email: Yup.string()
          .email()
          .required(),
      })
      .isValid(req.body);

    if (!valid) {
      throw new ServerError('Erro de validação', 400, 'warn');
    }

    await UserService.resetPasswordRequest(req.body.email);

    return res.status(202).end();
  }

  /**
   * Changes a user password using a single use token.
   *
   * @param {Request} req the request object
   * @param {Response} res the response object
   * @returns a promise that resolves to void after the response is sent, response body is empty
   */
  async resetPassword(req, res) {
    const valid = await Yup.object()
      .shape({
        password: Yup.string()
          .transform(value => (!value ? null : value))
          .matches(/^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/)
          .required(),
        token: Yup.string().required(),
      })
      .isValid(req.body);

    if (!valid) {
      throw new ServerError('Erro de validação', 400, 'warn');
    }

    await UserService.resetPassword(req.body.token, req.body.password);

    return res.status(202).end();
  }
}

export default new SessionController();
