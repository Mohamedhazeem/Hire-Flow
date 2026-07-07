import { DustParticle } from "../../particles/dust-particle";
import { particles } from "../../particles/particle-config";

export function AuthBackground() {
  return (
    <>
      {particles.map((particle) => (
        <DustParticle key={particle.id} particle={particle} />
      ))}
    </>
  );
}
