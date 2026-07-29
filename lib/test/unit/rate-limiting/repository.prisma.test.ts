import { describe, beforeEach } from "vitest";
import { FakeRepository } from "@/lib/rate-limiting/repository.fake";
import { runRepositoryContractTests } from "./contract/repository-contract";

describe("FakeRepository contract", () => {
  let repo: FakeRepository;

  beforeEach(() => {
    repo = new FakeRepository();
  });

  runRepositoryContractTests("FakeRepository", () => repo);
});
