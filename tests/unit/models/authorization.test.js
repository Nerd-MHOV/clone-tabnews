import { InternalServerError } from "infra/errors";
import authorization from "models/authorization";

describe("models/authorization.js", () => {
  describe(".can()", () => {
    test("without user", () => {
      expect(() => {
        authorization.can();
      }).toThrow(InternalServerError);
    });

    test("without `user.features`", () => {
      const createdUser = {
        username: "without features",
      };
      expect(() => {
        authorization.can(createdUser);
      }).toThrow(InternalServerError);
    });

    test("with unknown `features`", () => {
      const createdUser = {
        features: ["unknown:feature"],
      };
      expect(() => {
        authorization.can(createdUser);
      }).toThrow(InternalServerError);
    });

    test("with valid `user` and known `features`", () => {
      const createdUser = {
        features: ["create:user"],
      };
      expect(authorization.can(createdUser, "create:user")).toBe(true);
    });
  });

  describe(".filterOutput()", () => {
    test("without user", () => {
      expect(() => {
        authorization.filterOutput();
      }).toThrow(InternalServerError);
    });

    test("without `user.features`", () => {
      const createdUser = {
        username: "without features",
      };
      expect(() => {
        authorization.filterOutput(createdUser);
      }).toThrow(InternalServerError);
    });

    test("with unknown `features`", () => {
      const createdUser = {
        features: ["unknown:feature"],
      };
      expect(() => {
        authorization.filterOutput(createdUser);
      }).toThrow(InternalServerError);
    });

    test("with `user` and known `features`, but unknown `resource`", () => {
      const createdUser = {
        features: ["create:user"],
      };
      expect(() => {
        authorization.filterOutput(createdUser, "create:user");
      }).toThrow(InternalServerError);
    });

    test("with valid `user`, known `features` and `resource`", () => {
      const createdUser = {
        features: ["read:user"],
      };

      const resource = {
        id: "123",
        username: "testuser",
        features: ["create:user"],
        email: "resouce@curso.dev",
        password: "resource",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      const result = authorization.filterOutput(
        createdUser,
        "read:user",
        resource,
      );

      expect(result).toEqual({
        id: "123",
        username: "testuser",
        features: ["create:user"],
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      });
    });
  });
});
