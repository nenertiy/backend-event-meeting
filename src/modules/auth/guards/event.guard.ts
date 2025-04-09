import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { EventsService } from 'src/modules/events/events.service';

@Injectable()
export class CanEventGuard implements CanActivate {
  constructor(private readonly eventsService: EventsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const eventId = request.params.id;

    if (!user) {
      throw new ForbiddenException('Пользователь не авторизован');
    }

    if (user.role === UserRole.ADMIN) {
      return true;
    }

    if (user.role === UserRole.ORGANIZER) {
      const event = await this.eventsService.findById(eventId);
      if (!event) {
        throw new ForbiddenException('Событие не найдено');
      }

      if (event.organizerId === user.organizer?.id) {
        return true;
      }
    }

    throw new ForbiddenException('Недостаточно прав для выполнения действия');
  }
}
