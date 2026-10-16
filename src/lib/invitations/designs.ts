// Add a design here only once its renderer is implemented.
export const invitationDesigns = {
  coastal: {
    name: "Coastal",
    description:
      "Warm ivory, soft taupe and an elegant portrait layout with a framed opening and photo gallery.",
  },
  classic: {
    name: "Classic",
    description:
      "An elegant invitation with a botanical opening, photos and music.",
  },
} as const;

export function supportedDesign(
  key: string,
): key is keyof typeof invitationDesigns {
  return Object.hasOwn(invitationDesigns, key);
}
