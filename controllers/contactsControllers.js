import HttpError from "../helpers/HttpError.js";

import {
  createContactSchema,
  updateContactSchema,
  updateFavoriteSchema,
} from "../models/contact.js";
import { Contact } from "../models/contact.js";

import ctrlWrapper from "../decorators/ctrlWrapper.js";

const getAllContacts = async (req, res) => {
  const { _id: owner } = req.user;
  const { page = 1, limit = 20, favorite } = req.query;
  const skip = (page - 1) * limit;
  const result = await Contact.find(
    { owner, ...(favorite ? { favorite } : {}) },
    "-createdAt -updatedAt",
    {
      skip,
      limit,
    }
  );
  console.log(result);
  res.json(result);
};

const getOneContact = async (req, res) => {
  console.log(req.params);
  const { id } = req.params;
  const { _id: owner } = req.user;
  // const result = await Contact.findOne({ _id: id });
  console.log("CONTACT", id);
  console.log("OWNER", owner);
  const result = await Contact.findOne({
    _id: id,
    owner,
  });
  if (!result) {
    throw HttpError(404, `Contact with id ${id} was not found`);
  }
  console.log(result);
  res.json(result);
};

const deleteContact = async (req, res) => {
  const { _id: owner } = req.user;
  const { id } = req.params;
  const result = await Contact.findOneAndDelete({
    _id: id,
    owner,
  }).populate("owner", "_id subscription email");
  if (!result) {
    throw HttpError(404);
  }
  console.log(result);
  // res.status(204).send()
  res.json(result);
};

const createContact = async (req, res) => {
  const { error } = createContactSchema.validate(req.body);
  if (error) {
    throw HttpError(400, error.message);
  }
  // const { name, email, phone } = req.body;
  const { _id: owner } = req.user;
  const result = await Contact.create({ ...req.body, owner });
  console.log(result);
  res.status(201).json(result);
};

const updateContact = async (req, res) => {
  const { error } = updateContactSchema.validate(req.body);
  if (error) {
    throw HttpError(400, error.message);
  }
  const { _id: owner } = req.user;
  const { id } = req.params;
  // const result = await Contact.findByIdAndUpdate(contactId, req.body, {
  //   new: true,
  // });
  const result = await Contact.findOneAndUpdate(
    {
      _id: id,
      owner,
    },
    req.body,
    { new: true }
  );
  console.log(result);
  if (!result) {
    throw HttpError(404);
  }
  res.json(result);
};

const updateFavorite = async (req, res) => {
  const { error } = updateFavoriteSchema.validate(req.body);
  if (error) {
    throw HttpError(400, error.message);
  }
  const { _id: owner } = req.user;
  const { id } = req.params;
  const result = await Contact.findOneAndUpdate({ _id: id, owner }, req.body, {
    new: true,
  });
  console.log(result);
  if (!result) {
    throw HttpError(404);
  }
  res.json(result);
};

export default {
  getAllContacts: ctrlWrapper(getAllContacts),
  getOneContact: ctrlWrapper(getOneContact),
  deleteContact: ctrlWrapper(deleteContact),
  createContact: ctrlWrapper(createContact),
  updateContact: ctrlWrapper(updateContact),
  updateFavorite: ctrlWrapper(updateFavorite),
};
