/* eslint-disable import/order */
import ServerError from '../../utils/ServerError';
import User from '../models/User';
import authConfig from '../../config/auth';
import jwt from 'jsonwebtoken';
import logger from '../../utils/logger';

/**
 * Service class to perform user related operations.
 */
class UserService {
  /**
   * Performs a login by email and password.
   *
   * @param {string} email the user's email
   * @param {string} password the user's password
   * @returns a promise that resolves to and object with the user data and a JWT token
   */
  async driverLogin(email, password) {
    const user = await User.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      throw new ServerError('Usuário inválido', 401, 'warn');
    }

    if (!(await user.checkPassword(password))) {
      logger.warn(`Wrong password attempt for user ${user.email}`);
      throw new ServerError('Senha inválida', 401, 'warn');
    }

    return this.buildAuthResponse(user);
  }

  /**
   * Creates a new driver user.
   *
   * @param {string} email the new user email
   * @param {string} password the new user password
   * @param {string} name the new user name
   * @param {string} phone the new user phone number
   * @param {string} app the acessed app
   * @returns a promise that resolves to the auth reponse object, user data and JWT token
   */
  async driverSignup(email, password, name, phone, app) {
    const id = await this.getCognitoId(email, process.env.AWS_COGNITO_CUSTOM_PROVIDER_ID);

    let existingUser = await User.findByPk(id);

    if (existingUser) {
      throw new ServerError('Já existe um usuário cadastrado com este email', 409, 'warn');
    }

    existingUser = await User.findOne({
      where: {
        phone,
      },
    });

    if (existingUser) {
      throw new ServerError('Já existe um usuário cadastrado com este telefone', 409, 'warn');
    }

    const user = await User.create(
      {
        id,
        email,
        pass: password,
        name,
        phone,
        authority: 'USER,DRIVER',
        userInfo: {
          name,
          email,
          phone,
        },
      },
      { include: [{ association: User.UserInfo }] }
    );

    return this.buildAuthResponse(user);
  }

  /**
   * Updates a user name and password if required.
   *
   * @param {string} userId the user's id
   * @param {string} name the user's name
   * @param {string} currentPassword the current password
   * @param {string} newPassword the new password
   * @returns a promise when the password is changed and saved
   */
  async updateUser(userId, name, currentPassword, newPassword) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new ServerError('Usuário não encontrado', 404, 'warn');
    }

    user.name = name;

    if (currentPassword && newPassword) {
      const isCorrect = await user.checkPassword(currentPassword);

      if (!isCorrect) {
        throw new ServerError('Senha inválida', 401, 'warn');
      }

      user.pass = newPassword;
    }

    await user.save();

    return user;
  }

  /**
   * Refreshes the user token.
   *
   * @param {string} userId the user id
   * @returns a promise that resolves to the auth reponse object, user data and JWT token
   */
  async refreshToken(userId) {
    const user = await User.findByPk(userId);

    // Create the userInfo association if doesn't exist yet.
    if (!user.userInfo) {
      await user.createUserInfo({
        name: user.name,
        email: user.email,
        phone: user.phone,
        doc: user.document,
      });
    }

    return this.buildAuthResponse(user);
  }

  /**
   * Builds the authentication response.
   *
   * @param {User} user the user entity
   * @returns a promise that resolves to an object with the user data and a JWT token if the account is verified
   */
  async buildAuthResponse(user) {
    return {
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        email: user.email,
        textToSpeech: user.textToSpeech,
        phone: user.phone,
      },
      token: jwt.sign({ id: user.id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    };
  }

  /**
   * Request a password reset for the user with the provided email. Sends an email with a link to a page where the user may change it's password.
   *
   * @param {string} email the user's email
   * @returns a promise that resolves to void after the email is sent
   */
  async resetPasswordRequest(email) {
    const userId = await this.getCognitoId(email, process.env.AWS_COGNITO_CUSTOM_PROVIDER_ID);

    const user = await User.findByPk(userId, {
      attributes: ['password', 'id', 'email', 'name'],
    });

    // If no user is found just return. Can't return error because we do not want a way for someone to find out valid emails
    if (!user) {
      return;
    }

    // Create a JWT token usable only for password reset. Signed with the current password hash so it can't be reused. Expires in 1 hour.
    const token = jwt.sign({ id: user.id }, user.password, {
      expiresIn: '1h',
    });

    await this.sendPasswordResetEmail(user.email, user.name, token);
  }

  /**
   * Changes a user password using a single use token as authentication.
   *
   * @param {string} token the single use token
   * @param {string} pass the new password
   * @returns a promise that resolves to void after the password is changed
   */
  async resetPassword(token, pass) {
    const decoded = jwt.decode(token);

    // If token is not a jwt token at all
    if (!decoded) {
      throw new ServerError('Este token não é válido', 401, 'warn');
    }

    const user = await User.findByPk(decoded.id, { attributes: ['password', 'id'] });

    try {
      // Validate the token using the current password hash as secret
      jwt.verify(token, user.password);
    } catch (err) {
      throw new ServerError('Este token não é válido', 401, 'warn');
    }

    user.pass = pass;
    await user.save();
  }
}

export default new UserService();
