import { UserEntity } from "../../users/entities/user.entity";
import { Entity, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'friendships' })
export class Friendship {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => UserEntity, user => user.friend, { onDelete: 'CASCADE' })
	user: UserEntity;

	@ManyToOne(() => UserEntity, user => user.friend, { onDelete: 'CASCADE' })
	friend: UserEntity;
}
