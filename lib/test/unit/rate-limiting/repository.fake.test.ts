import { runRepositoryContractTests } from "./contract/repository-contract";
import { FakeRepository } from "@/lib/rate-limiting/repository.fake";

runRepositoryContractTests("FakeRepository", () => new FakeRepository());
