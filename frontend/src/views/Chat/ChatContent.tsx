import { Avatar, Box, Button, Card, Divider, styled, Typography } from '@mui/material';
import { useEffect, useRef } from 'react';

import ScheduleTwoToneIcon from '@mui/icons-material/ScheduleTwoTone';
import {
  format, formatDistance, isSameDay, parseISO
} from 'date-fns';
import useAuth from '../../hooks/useAuth';

const DividerWrapper = styled(Divider)(
  ({ theme }) => `
      .MuiDivider-wrapper {
        border-radius: ${theme.general.borderRadiusSm};
        text-transform: none;
        background: ${theme.palette.background.default};
        font-size: ${theme.typography.pxToRem(13)};
        color: ${theme.colors.alpha.black[50]};
      }
`
);

const CardWrapperPrimary = styled(Card)(
  ({ theme }) => `
      background: ${theme.colors.primary.main};
      color: ${theme.palette.primary.contrastText};
      padding: ${theme.spacing(2)};
      border-radius: ${theme.general.borderRadiusXl};
      border-top-right-radius: ${theme.general.borderRadius};
      max-width: 380px;
      display: inline-flex;
`
);

const CardWrapperSecondary = styled(Card)(
  ({ theme }) => `
      background: ${theme.colors.alpha.black[10]};
      color: ${theme.colors.alpha.black[100]};
      padding: ${theme.spacing(2)};
      border-radius: ${theme.general.borderRadiusXl};
      border-top-left-radius: ${theme.general.borderRadius};
      max-width: 380px;
      display: inline-flex;
`
);

function ChatContent(props) {
  const bottomRef = useRef(null);
  const { socket, user } = useAuth();
  useEffect(() => {
    // scroll to bottom every time messages change
    bottomRef.current?.scrollIntoView();
  }, [props]);
  const fomatOthersMessage = (msg: string): string => {
    msg = msg.replace(/(.{40})(?=\S)/g, '$1 ')
    return msg
  }
  const fomatOwnMessage = (msg: string): string => {
    msg = msg.replace(/(.{40})(?=\S)/g, '$1 ')
    return msg
  }

  const joinPublicChannel = async () => {
    try {
      socket.emit('joinPublicChannel', { channelId: props.currentChannel.id}, (response) => {

      });
    } catch (err) {
      console.error("Error response:");
      console.error(err);
    }
  };

  return (
    <Box p={3}>
      {!props.currentChannel ?
        <Typography variant={"h4"}>
          Veuillez selectionner une conversation.
        </Typography>
        :
        props.currentChannel && props.currentChannel.type == "protected" && !props.currentChannel.messages ?
          <Typography variant={"h4"}>
            Protected channel ! Please enter password bellow
          </Typography>
          :
          props.currentChannel && props.currentChannel.type == "public" && !props.currentChannel.users.find(userSearch => userSearch.id == user.id) ?
          <Button variant="contained" onClick={joinPublicChannel}>
          Rejoindre ce channel public
        </Button>
            :
            props.currentChannel && props.currentChannel.messages &&
            props.currentChannel.messages.map(function (message, index) {
              if (!props.currentChannel.users.find(userSearch => userSearch.id == user.id).blockedUsers?.find(blockedUser => blockedUser.id == message.author.id))
                return (
                  <div key={index}>
                    {(index == 0 || !isSameDay(parseISO(props.currentChannel.messages[index - 1].createDateTime), parseISO(message.createDateTime))) &&
                      <DividerWrapper sx={{ mt: 2 }}>
                        {format(parseISO(message.createDateTime), 'dd MMMM  yyyy')}
                      </DividerWrapper>
                    }
                    {(message.author.username == user.username) ?
                      <Box
                        display="flex"
                        alignItems="flex-start"
                        justifyContent="flex-end"
                        pt={1}
                      >
                        <Box
                          display="flex"
                          alignItems="flex-end"
                          flexDirection="column"
                          justifyContent="flex-end"
                          mr={2}
                        >
                          <CardWrapperPrimary
                            sx={!(index == 0 || props.currentChannel.messages[index - 1].author.id !== message.author.id) && {
                              mr: 6
                            }}
                          >
                            {fomatOwnMessage(message.content)}
                          </CardWrapperPrimary>
                          {(index == props.currentChannel.messages.length - 1 || props.currentChannel.messages[index + 1].author.id !== message.author.id) &&
                            <Typography
                              variant="subtitle1"
                              sx={{
                                mr: 6,
                                pt: 1,
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              <ScheduleTwoToneIcon
                                sx={{
                                  mr: 0.5
                                }}
                                fontSize="small"
                              />
                              {formatDistance(parseISO(message.createDateTime), new Date(), {
                                addSuffix: true
                              })}
                            </Typography>
                          }
                        </Box>
                        {(index == 0 || props.currentChannel.messages[index - 1].author.id !== message.author.id) &&
                          <Avatar
                            variant="rounded"
                            sx={{
                              width: 50,
                              height: 50
                            }}
                            alt={user.username}
                            src={user.avatar}
                          />
                        }
                      </Box> :
                      <Box
                        display="flex"
                        alignItems="flex-start"
                        justifyContent="flex-start"
                        pt={1}
                      >
                        {(index == 0 || props.currentChannel.messages[index - 1].author.id !== message.author.id) &&
                          <Avatar
                            variant="rounded"
                            sx={{
                              width: 50,
                              height: 50
                            }}
                            alt={message.author.username}
                            src={message.author.avatar}
                          />
                        }
                        <Box
                          display="flex"
                          alignItems="flex-start"
                          flexDirection="column"
                          justifyContent="flex-start"
                          ml={2}
                        >
                          <CardWrapperSecondary
                            sx={!(index == 0 || props.currentChannel.messages[index - 1].author.id !== message.author.id) && {
                              ml: 6
                            }}
                          >
                            {fomatOthersMessage(message.content)}
                          </CardWrapperSecondary>
                          {(index == props.currentChannel.messages.length - 1 || props.currentChannel.messages[index + 1].author.id !== message.author.id) &&
                            <Typography
                              variant="subtitle1"
                              sx={{
                                pt: 1,
                                ml: 3,
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              <ScheduleTwoToneIcon
                                sx={{
                                  mr: 0.5
                                }}
                                fontSize="small"
                              />
                              {formatDistance(parseISO(message.createDateTime), new Date(), {
                                addSuffix: true
                              })}
                            </Typography>
                          }
                        </Box>
                      </Box>
                    }
                  </div>)
            })
      }
      <div ref={bottomRef}></div>
    </Box>
  );
}

export default ChatContent;