import { PrimaryGeneratedColumn, Column, Entity, ManyToMany, OneToMany, JoinTable } from 'typeorm';
import {
    IsString,
    IsPositive,
    IsBoolean,
    IsEmail,
    IsInt
} from "class-validator";
import { ChannelEntity } from '../../channels/entities/channel.entity';
import { Friendship } from '../../friendship/entities/friendship.entity';
import { MatchEntity } from '../../pong/match/entities/match.entity';

@Entity({ name: 'users' })
export abstract class UserEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true, default: null, unique: true })
    @IsInt()
    fortytwoId?: number | null;

    @Column({ type: 'varchar', length: 50, unique: true })
    @IsString()
    username: string;

    @Column({ type: 'varchar', length: 50, unique: true })
    @IsString()
    @IsEmail()
    email: string;

    @Column({ type: 'varchar', length: 150, nullable: true })
    @IsString()
    password?: string | null;

    @Column({ type: 'varchar', length: 150, nullable: true, default: '/' })
    @IsString()
    avatar?: string | null;

    @Column({ type: 'boolean', default: false })
    @IsBoolean()
    is2FAactive: boolean;

    @Column({ type: 'varchar', length: 50, nullable: true })
    @IsString()
    secretOf2FA?: string | null;

    @Column({ default: 0 })
    @IsPositive()
    @IsInt()
    xp: number;

    @Column({ default: 0 })
    @IsPositive()
    @IsInt()
    nbOfGames: number;

    @ManyToMany((type) => ChannelEntity, (channel) => channel.users)
    channels: ChannelEntity[];

    @OneToMany((type) => ChannelEntity, (channel) => channel.owner)
    channelsOwned: ChannelEntity[];

    @ManyToMany((type) => ChannelEntity, (channel) => channel.adminUsers)
    channelsAdmin: ChannelEntity[];

    @ManyToMany((type) => ChannelEntity, (channel) => channel.mutedUsers)
    channelsMuted: ChannelEntity[];

    @ManyToMany((type) => UserEntity, (user) => user.usersWhoBlockedMe)
    @JoinTable({
        name: "blockedUsers",
        joinColumn: { name: "blockerId", referencedColumnName: 'id' },
        inverseJoinColumn: { name: "blockedId", referencedColumnName: 'id' }
    })
    blockedUsers: UserEntity[];

    @ManyToMany((type) => UserEntity, (user) => user.blockedUsers)
    usersWhoBlockedMe: UserEntity[];

    @OneToMany(() => Friendship, (friend) => friend.user)
    friend: Friendship[];

    @OneToMany((type) => MatchEntity, (match) => match.userHome)
    matchesHome: MatchEntity[];

    @OneToMany((type) => MatchEntity, (match) => match.userForeign)
    matchesForeign: MatchEntity[];

}
