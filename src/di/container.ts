import { createContainer, InjectionMode, AwilixContainer } from "awilix";
import type { Cradle } from "@src/di/cradle";
import { registerInfrastructureModule } from "@src/di/modules/infrastructure";
import { registerAdminModule } from "@src/di/modules/admin";
import { registerAuthModule } from "@src/di/modules/auth";
import { registerCategoriesModule } from "@src/di/modules/categories";
import { registerCommentsModule } from "@src/di/modules/comments";
import { registerEventBookingsModule } from "@src/di/modules/eventBookings";
import { registerEventInvitationsModule } from "@src/di/modules/eventInvitations";
import { registerEventsModule } from "@src/di/modules/events";
import { registerFavoritesModule } from "@src/di/modules/favorites";
import { registerFollowsModule } from "@src/di/modules/follows";
import { registerImagesModule } from "@src/di/modules/images";
import { registerMessagesModule } from "@src/di/modules/messages";
import { registerNotificationsModule } from "@src/di/modules/notifications";
import { registerPartnershipsModule } from "@src/di/modules/partnerships";
import { registerPlacesModule } from "@src/di/modules/places";
import { registerProductsModule } from "@src/di/modules/products";
import { registerReviewsModule } from "@src/di/modules/reviews";
import { registerUsersModule } from "@src/di/modules/users";

export type { Cradle };

export const createAppContainer = (): AwilixContainer<Cradle> => {
  const container = createContainer<Cradle>({
    injectionMode: InjectionMode.PROXY,
    strict: true,
  });

  registerInfrastructureModule(container);
  registerPlacesModule(container);
  registerUsersModule(container);
  registerAuthModule(container);
  registerAdminModule(container);
  registerCategoriesModule(container);
  registerCommentsModule(container);
  registerEventBookingsModule(container);
  registerEventInvitationsModule(container);
  registerEventsModule(container);
  registerFavoritesModule(container);
  registerFollowsModule(container);
  registerImagesModule(container);
  registerMessagesModule(container);
  registerNotificationsModule(container);
  registerPartnershipsModule(container);
  registerProductsModule(container);
  registerReviewsModule(container);

  return container;
};

export const container = createAppContainer();
export const cradle = container.cradle;
