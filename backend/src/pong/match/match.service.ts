import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { MatchEntity } from './entities/match.entity';

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(MatchEntity)
    private matchRepository: Repository<MatchEntity>,
  ) {}

  create(createMatchDto: CreateMatchDto) {
    const newMatch: MatchEntity = this.matchRepository.create(createMatchDto)
    this.matchRepository.save(newMatch)
    return 'This action adds a new match';
  }

  async getFortyUserMatches(user: UserEntity) {
    let userID = user.id;
    
    const matchs = await this.matchRepository
    .createQueryBuilder('match')
    .limit(40)
    .leftJoin('match.userHome', 'userHome')
    .addSelect(['userHome.id', 'userHome.username'])
    .leftJoin('match.userForeign', 'userForeign')
    .addSelect(['userForeign.id', 'userForeign.username'])
    .leftJoin('match.winner', 'winner')
    .addSelect(['winner.id'])
    .where("match.userForeign.id = :userForeignId", { userForeignId: userID })
    .orWhere("match.userHome.id = :userHomeId", { userHomeId: userID })
    .orderBy('match.createDateTime', 'DESC')
    .getMany();
    return matchs;
  }

  async getOneYearMatches(userID: number) {
    //! Date() month are indexed at 0 so November === 10
    //Getting a one year period :
    const endDate = new Date().toISOString();
    var startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);

    return (await this.matchRepository
    .createQueryBuilder('match')
    .leftJoin('match.userHome', 'userHome')
    .addSelect(['userHome.id', 'userHome.username'])
    .leftJoin('match.userForeign', 'userForeign')
    .addSelect(['userForeign.id', 'userForeign.username'])
    .leftJoin('match.winner', 'winner')
    .addSelect(['winner.id', 'winner.username'])
    .where('match.createDateTime > :startDate', {startDate: startDate})
    .andWhere('match.createDateTime < :endDate', {endDate: endDate})
    .andWhere(
      new Brackets((qb) => {
          qb.where("match.userForeign.id = :userForeignId", { userForeignId: userID })
          .orWhere("match.userHome.id = :userHomeId", { userHomeId: userID })
      }))
    .getMany())
  }

  getLongestWinningStreak(userId:number, matchesOnOneYear: any[]) {
    let winningStreak = 0;
    let longestWinningStreak = 0;

    if (matchesOnOneYear.length == 0)
      return 0;
    for (let i = 0; i < matchesOnOneYear.length; i++) {
      if (matchesOnOneYear[i].winner.id == userId)
        winningStreak++;
      else {
        if (winningStreak > longestWinningStreak)
          longestWinningStreak = winningStreak
        winningStreak = 0;
      }
    }
    return (longestWinningStreak > winningStreak ? longestWinningStreak : winningStreak);
  }

  getMaxNbOfGamesInOneDay(matchesOnOneYear: MatchEntity[]) {
    let nbOfGamesInOneDay = 1;
    let maxNbOfGamesInOneDay = 1;

    if (matchesOnOneYear.length == 0)
      return 0;
    for (let i = 0; i < matchesOnOneYear.length - 1; i++) {
      if (matchesOnOneYear[i].createDateTime.toDateString() == matchesOnOneYear[i + 1].createDateTime.toDateString())
        nbOfGamesInOneDay++;
      else {
        if (nbOfGamesInOneDay > maxNbOfGamesInOneDay)
          maxNbOfGamesInOneDay = nbOfGamesInOneDay;
        nbOfGamesInOneDay = 1;
      }
    }
    return (maxNbOfGamesInOneDay > nbOfGamesInOneDay ? maxNbOfGamesInOneDay : nbOfGamesInOneDay);
  }

  async getThisYearAchievements(user: UserEntity) {
    const matchesOnOneYear = await this.getOneYearMatches(user.id);
    const longestWinningStreak = this.getLongestWinningStreak(user.id, matchesOnOneYear);
    const maxNbOfGamesInOneDay = this.getMaxNbOfGamesInOneDay(matchesOnOneYear);

    const achievements = {
      totalNbOfGamesPlayed:  matchesOnOneYear.length,
      longestWinningStreak:  longestWinningStreak,
      maxNbOfGamesInOneDay:  maxNbOfGamesInOneDay,
    };
    return achievements;
  }
}
