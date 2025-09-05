exports.up = (pgm) => {
  pgm.createTable("users", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },

    // For reference, GitHub username max length is 39 characters
    username: {
      type: "varchar(30)",
      unique: true,
      notNull: true,
    },

    // This is limit to emails
    email: {
      type: "varchar(254)",
      notNull: true,
      unique: true,
    },

    // Hashed password (bcrypt) max length is 60 characters
    password: {
      type: "varchar(60)",
      notNull: true,
    },

    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('utc', now())"),
    },

    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('utc', now())"),
    },
  });
};

exports.down = false;
