function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={"animate-pulse rounded-md bg-skeleton" + (className ? " " + className : "")}
      {...props}
    />
  );
}

export { Skeleton };
