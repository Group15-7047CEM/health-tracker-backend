import * as Joi from '@hapi/joi';

// export const passwordSchema = Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,16}$/);
export const passwordSchema = Joi.string().pattern(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+|~=\\`{}[\]:";'<>?,.\/-])[A-Za-z\d!@#$%^&*()_+|~=\\`{}[\]:";'<>?,.\/-]{8,16}$/,
);
export const passwordErrMessage = `Password must contain min 8 characters, max 16 characters, one uppercase, one lowercase, one number and one special character !@#$%^&*()_+|~-=\\\`{}[]:";'<>?,./`;

/*
Validations required:
- Be a minimum length of eight (8) characters on all systems.
- Contain both upper and lower case characters (e.g., a-z, A-Z)
- Have digits and punctuation characters as well as letters e.g., 0-9, !@#$%^&*()_+|~-=\`{}[]:";'<>?,./) 
- Password change notification for 90 calendar days. 
- Not be identical to the previous ten (10) passwords. 
- Not be transmitted in the clear or plaintext outside the secure location. 
- Not be displayed when entered. 
- Ensure passwords are only reset for authorized users only. 
*/
