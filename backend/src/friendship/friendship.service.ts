import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { UpdateFriendshipDto } from './dto/update-friendship.dto';
import { Friendship } from './entities/friendship.entity';
import { UserEntity } from '../users/entities/user.entity';

export enum RelationshipStatus {
  FRIEND = 'friend',
  PENDING = 'pending',
  REQUESTED = 'requested',
  NOTFRIEND = 'notFriend',
}

@Injectable()
export class FriendshipService {
  constructor(
    @InjectRepository(Friendship)
    private friendshipRepository: Repository<Friendship>,
    private readonly usersService: UsersService,
  ) { }

  async createFriendship(me: UserEntity, user: UserEntity) {
    //if friendship already in db, return
    if (await this.friendshipRepository.findOne({
      where: {
        user: me,
        friend: user,
      },
    }))
      return;
    const friendship = await this.friendshipRepository.create({
      user: me,
      friend: user,
    });
    return this.friendshipRepository.save(friendship);
  }

  async removeFriendshipEntirely(me: UserEntity, user: UserEntity) {
    const myFriendship = await this.friendshipRepository.findOne({
      where: {
        user: me,
        friend: user,
      },
    });
    const userFriendship = await this.friendshipRepository.findOne({
      where: {
        user: user,
        friend: me,
      },
    });
    if (myFriendship) this.friendshipRepository.delete(myFriendship);
    if (userFriendship) this.friendshipRepository.delete(userFriendship);
    return true;
  }

  async findRelationshipStatus(
    me: UserEntity,
    user: UserEntity,
  ): Promise<RelationshipStatus> {
    let relationshipStatus: RelationshipStatus;

    //looking for friend request from me to other user
    const pending = await this.friendshipRepository.findOne({
      where: { user: me, friend: user },
    });
    //looking for friend request from other user to me
    const requested = await this.friendshipRepository.findOne({
      where: { user: user, friend: me },
    });

    if (pending && requested) relationshipStatus = RelationshipStatus.FRIEND;
    else if (pending) relationshipStatus = RelationshipStatus.PENDING;
    else if (requested) relationshipStatus = RelationshipStatus.REQUESTED;
    else relationshipStatus = RelationshipStatus.NOTFRIEND;

    return relationshipStatus;
  }
  async findAllMyFriendsRequests(me: UserEntity) {
    //get users who are friends with me but I am not friends with them
    const pending = await this.friendshipRepository.find({//my requests
      where: {
        user: me,
      },
      relations: ['friend'],
      select: {
        friend: {
          id: true,
          username: true,
        },
      },
    });

    const requested = await this.friendshipRepository.find({
      where: {
        friend: me,
      },
      relations: ['user'],
      select: {
        user: {
          id: true,
          username: true,
          avatar: true,
          xp: true,
          nbOfGames: true
        },
      },
    });

    const blockedUsers = await this.usersService.findAllBlockedUsers(me);
    const pendingRequests = [];
    for (let i = 0; i < requested.length; i++) {
      if (!blockedUsers.find((blocked) => blocked.id === requested[i].user.id) && !pending.find((request) => request.friend.id == requested[i].user.id))
        pendingRequests.push(requested[i].user);
    }
    return pendingRequests;
  }

  async findAllMyPendingFriends(me: UserEntity) {
    //get users who are not friends with me but I am friends with them
    const pending = await this.friendshipRepository.find({
      where: {
        user: me,
      },
      relations: ['friend'],
      select: {
        friend: {
          id: true,
          username: true,
          avatar: true,
          xp: true,
          nbOfGames: true
        },
      },
    });

    const requested = await this.friendshipRepository.find({
      where: {
        friend: me,
      },
      relations: ['user'],
      select: {
        user: {
          id: true,
        },
      },
    });

    const blockedUsers = await this.usersService.findAllBlockedUsers(me);
    const pendingRequests = [];
    for (let i = 0; i < pending.length; i++) {
      if (!blockedUsers.find((blocked) => blocked.id === pending[i].friend.id) && !requested.find((request) => request.user.id === pending[i].friend.id))
        pendingRequests.push(pending[i].friend);
    }
    return pendingRequests;
  }

  async findAllFriends(me: UserEntity) {
    //get friendships where I am friend with them and THEY are friends with me
    const pending = await this.friendshipRepository.find({
      where: {
        user: me,
      },
      relations: ['friend'],
      select: {
        friend: {
          id: true,
          username: true,
          avatar: true,
          xp: true,
          nbOfGames: true
        },
      },
    });

    const requested = await this.friendshipRepository.find({
      where: {
        friend: me,
      },
      relations: ['user'],
      select: {
        user: {
          id: true,
        },
      },
    });

    const blockedUsers = await this.usersService.findAllBlockedUsers(me);
    const friendships = [];

    for (let i = 0; i < pending.length; i++) {
      let friendId = pending[i].friend.id;
      if (
        requested.find((request) =>
          request.user.id === friendId &&
          !blockedUsers.find((blocked) => blocked.id === request.user.id),
        )
      )
        friendships.push(pending[i].friend);
    }
    return friendships;
  }
}