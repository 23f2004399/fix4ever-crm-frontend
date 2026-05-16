import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { chatCenterAPI } from '../../lib/api'
import { MessageSquare, Send, Search } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ChatCenter() {
  const [chats, setChats] = useState<any[]>([])
  const [selectedChat, setSelectedChat] = useState<any>(null)
  const [message, setMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState({
    status: 'all',
    priority: 'all',
  })

  useEffect(() => {
    fetchChats()
  }, [filter])

  const fetchChats = async () => {
    setIsLoading(true)
    try {
      const response = await chatCenterAPI.getAllChats({
        status: filter.status !== 'all' ? filter.status : undefined,
        priority: filter.priority !== 'all' ? filter.priority : undefined,
        search: searchTerm || undefined,
      })

      if (response.data.success) {
        setChats(response.data.data)
      }
    } catch (error: any) {
      toast.error('Failed to load chats')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchChatDetails = async (chatId: string) => {
    try {
      const response = await chatCenterAPI.getChatDetails(chatId)
      if (response.data.success) {
        setSelectedChat(response.data.data)
      }
    } catch (error: any) {
      toast.error('Failed to load chat details')
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat) return

    try {
      await chatCenterAPI.sendMessage(selectedChat._id, {
        message: message.trim(),
      })

      toast.success('Message sent')
      setMessage('')
      fetchChatDetails(selectedChat._id)
    } catch (error: any) {
      toast.error('Failed to send message')
    }
  }

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      medium:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    }

    return (
      <Badge className={colors[priority] || ''}>{priority.toUpperCase()}</Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      'default' | 'secondary' | 'destructive' | 'outline'
    > = {
      active: 'default',
      closed: 'outline',
      escalated: 'destructive',
    }

    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Chat Center</h1>
        <p className="text-muted-foreground mt-1">
          Manage customer and service provider communications
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Chats</CardTitle>
            <CardDescription>{chats.length} conversations</CardDescription>

            {/* Search */}
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search chats..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchChats()}
                className="pl-9"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <select
                value={filter.status}
                onChange={e => setFilter({ ...filter, status: e.target.value })}
                className="px-3 py-2 border border-input rounded-md bg-background text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="escalated">Escalated</option>
              </select>

              <select
                value={filter.priority}
                onChange={e =>
                  setFilter({ ...filter, priority: e.target.value })
                }
                className="px-3 py-2 border border-input rounded-md bg-background text-sm"
              >
                <option value="all">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : chats.length === 0 ? (
              <div className="text-center py-8 px-4">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No chats found</p>
              </div>
            ) : (
              <div className="divide-y">
                {chats.map(chat => (
                  <div
                    key={chat._id}
                    className={`p-4 cursor-pointer hover:bg-accent transition-colors ${
                      selectedChat?._id === chat._id ? 'bg-accent' : ''
                    }`}
                    onClick={() => fetchChatDetails(chat._id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {chat.participants
                            ?.map((p: any) => p.name)
                            .join(', ') || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {chat.relatedTo?.type || 'General'}
                        </p>
                      </div>
                      {getPriorityBadge(chat.priority)}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {chat.lastMessage?.content || 'No messages'}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      {getStatusBadge(chat.status)}
                      <span className="text-xs text-muted-foreground">
                        {chat.lastMessage?.timestamp
                          ? new Date(
                              chat.lastMessage.timestamp
                            ).toLocaleDateString()
                          : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedChat
                ? selectedChat.participants?.map((p: any) => p.name).join(', ')
                : 'Select a chat'}
            </CardTitle>
            {selectedChat && (
              <CardDescription>
                {selectedChat.relatedTo?.type} -{' '}
                {getStatusBadge(selectedChat.status)}
              </CardDescription>
            )}
          </CardHeader>

          <CardContent>
            {!selectedChat ? (
              <div className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Select a chat to view messages
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Messages */}
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {selectedChat.messages && selectedChat.messages.length > 0 ? (
                    selectedChat.messages.map((msg: any, index: number) => (
                      <div
                        key={index}
                        className={`flex ${
                          msg.senderRole === 'crm_manager' ||
                          msg.senderRole === 'admin'
                            ? 'justify-end'
                            : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            msg.senderRole === 'crm_manager' ||
                            msg.senderRole === 'admin'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(msg.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No messages yet
                    </p>
                  )}
                </div>

                {/* Message Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
