module.exports = {
  EN: {
    NOTICE_NOT_FOUND: 'Notice not found',
    NOTICE_INVALID_TITLE: 'Title should be from 2 to 100 characters',
    NOTICE_INVALID_DESCRIPTION: 'Description should be from 50 to 500 characters',
    TOKEN_REQUIRED: 'A token is required for authentication',
    INVALID_DATE: 'Invalid date',
    INVALID_CLAIM_TYPE: 'Invalid claim type',
    INVALID_USER_ID: 'Invalid user id',
    INVALID_ARRIVAL_TIME: 'Invalid arrival time',
    ADDITIONAL_PEOPLE_ERROR: 'Invalid additional people field, should be a number',
    INVALID_COMMENT: 'Invalid comment field',
    COMMENT_LENGTH_ERROR: 'Invalid comment length, should be from 10 to 300',
    INVALID_QUESTIONABLE: 'Invalid questionable field, should be boolean',
    GUEST_FIELD_ERROR: 'Field guest must be an object',
    NAME_FIELD_ERROR: 'Name should be from 2 to 30 characters',
    SURNAME_FIELD_ERROR: 'Surname should be from 2 to 30 characters',
    PHONE_FIELD_ERROR: 'Phone should be 12 numbers',
    NAME_FIELD_TYPE_ERROR: 'Field guest name must be a string',
    SURNAME_FIELD_TYPE_ERROR: 'Field guest surname must be a string',
    AUTH_REQUIRED: 'Authorization required',
    GUEST_FIELDS_ERROR: 'Name, surname and phone field must be provided for guest',
    CREATE_NOT_YOURS_CLAIM_ERROR: 'Can not create claim for not yourself',
    FORBIDDEN: 'Forbidden',
    CLAIM_NOT_FOUND: 'Claim not found',
    UPDATE_NOT_YOURS_CLAIM_ERROR: 'Can not update not yours claim',
    DELETE_NOT_YOURS_CLAIM_ERROR: 'Can not delete not yours claim',
    INVALID_GUEST_ID: 'Guest id should be an uuid',
  },
  RU: {
    NOTICE_NOT_FOUND: 'Запись не найдена',
    NOTICE_INVALID_TITLE: 'Заголовок должен быть от 2 до 100 символов',
    NOTICE_INVALID_DESCRIPTION: 'Описание должно быть от 50 до 500 символов',
    TOKEN_REQUIRED: 'Для аутентификации требуется токен доступа',
    INVALID_DATE: 'Неверно указана дата',
    INVALID_CLAIM_TYPE: 'Неверный тип смены',
    INVALID_USER_ID: 'Неверный идентификатор пользователя',
    INVALID_ARRIVAL_TIME: 'Неверно указано время прибытия на смену',
    ADDITIONAL_PEOPLE_ERROR: 'Неверно указанно число дополнительных людей',
    INVALID_COMMENT: 'Некорректно заполнено поле для комментария',
    COMMENT_LENGTH_ERROR: 'Количество символоов поля для комментария должно быть от 10 до 300',
    INVALID_QUESTIONABLE: 'Должно быть булевой переменной',
    GUEST_FIELD_ERROR: 'Поле гость должно быть обьектом',
    NAME_FIELD_ERROR: 'Имя должно быть от 2 до 30 символов',
    SURNAME_FIELD_ERROR: 'Фамилия должна быть от 2 до 30 символов',
    PHONE_FIELD_ERROR: 'Телефон должен быть 12 символов (только цифры)',
    NAME_FIELD_TYPE_ERROR: 'Имя гостя должно быть строкой',
    SURNAME_FIELD_TYPE_ERROR: 'Фамилия гостя должна быть строкой',
    AUTH_REQUIRED: 'Аутентификация обязательна',
    GUEST_FIELDS_ERROR: 'Поля имя, фамилия и телефон - обязательны для гостя',
    CREATE_NOT_YOURS_CLAIM_ERROR: 'Записываться в график можно только за себя',
    FORBIDDEN: 'Недостаточно прав',
    CLAIM_NOT_FOUND: 'Запись не найдена',
    INVALID_GUEST_ID: 'Неверный идентификатор гостя',
  },
};
