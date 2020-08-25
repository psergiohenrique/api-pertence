import jwt from "jsonwebtoken";
import authConfig from "../../config/auth";

import Address from "../models/Address";
import User from "../models/User";

import ServerError from "../../utils/ServerError";
import logger from "../../utils/logger";

/**
 * Service class to perform user related operations.
 */
class UserService {
  /**
   * Performs a login by username and password.
   *
   * @param {string} username the user's username
   * @param {string} password the user's password
   * @returns a promise that resolves to and object with the user data and a JWT token
   */
  async userLogin(username, password) {
    const user = await User.findOne({
      where: {
        username,
      },
    });

    if (!user) {
      throw new ServerError("Usuário inválido", 401, "warn");
    }

    if (!(await user.checkPassword(password))) {
      logger.warn(`Wrong password attempt for user ${user.email}`);
      throw new ServerError("Senha inválida", 401, "warn");
    }

    return this.buildAuthResponse(user);
  }

  /**
   * Creates a new user.
   *
   * @param {string} userInfos the new user infos
   * @returns a promise that resolves to the auth reponse object, user data and JWT token
   */
  async userSignup(userInfos) {
    const existingUser = await User.findOne({
      where: {
        username: userInfos.username,
      },
    });

    if (existingUser) {
      throw new ServerError(
        "Já existe um usuário cadastrado com este nome de usuário",
        409,
        "warn"
      );
    }

    const user = await User.create({
      email: userInfos.email,
      pass: userInfos.password,
      phone: userInfos.phone,
      fullName: userInfos.fullName,
      textToSpeech: userInfos.textToSpeech,
      role: userInfos.role,
      username: userInfos.username,
    });

    const address = await Address.create({
      street: userInfos.street,
      city: userInfos.city,
      uf: userInfos.uf,
      neighborhood: userInfos.neighborhood,
      state: userInfos.state,
      country: userInfos.country,
      number: userInfos.number,
    });

    console.log(address, "Address CREATE");

    user.update({
      addressId: address.id,
    });

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
      throw new ServerError("Usuário não encontrado", 404, "warn");
    }

    user.name = name;

    if (currentPassword && newPassword) {
      const isCorrect = await user.checkPassword(currentPassword);

      if (!isCorrect) {
        throw new ServerError("Senha inválida", 401, "warn");
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
   * @param {string} username the user's username
   * @returns a promise that resolves to void after the email is sent
   */
  async resetPasswordRequest(username) {
    const user = await User.findOne(
      {
        where: {
          username,
        },
      },
      {
        attributes: ["password", "id", "email", "name"],
      }
    );

    // If no user is found just return. Can't return error because we do not want a way for someone to find out valid emails
    if (!user) {
      return;
    }

    // Create a JWT token usable only for password reset. Signed with the current password hash so it can't be reused. Expires in 1 hour.
    const token = jwt.sign({ id: user.id }, user.password, {
      expiresIn: "1h",
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
      throw new ServerError("Este token não é válido", 401, "warn");
    }

    const user = await User.findByPk(decoded.id, {
      attributes: ["password", "id"],
    });

    try {
      // Validate the token using the current password hash as secret
      jwt.verify(token, user.password);
    } catch (err) {
      throw new ServerError("Este token não é válido", 401, "warn");
    }

    user.pass = pass;
    await user.save();
  }
}

export default new UserService();
