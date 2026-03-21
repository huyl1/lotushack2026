import {
  Avatar,
  Badge,
  Box,
  Card,
  Flex,
  Grid,
  Separator,
  Text,
} from "@radix-ui/themes";
import {
  RocketIcon,
  FileTextIcon,
  PersonIcon,
  ClockIcon,
  ExitIcon,
} from "@radix-ui/react-icons";
import { createClient } from "@/lib/supabase/server";
import { signout } from "@/app/login/actions";

const stats = [
  { label: "Projects", value: "0", icon: RocketIcon },
  { label: "Submissions", value: "0", icon: FileTextIcon },
  { label: "Team Members", value: "1", icon: PersonIcon },
  { label: "Days Left", value: "12", icon: ClockIcon },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const activity = [
    { text: "You joined Edify", time: "Just now", type: "join" as const },
    {
      text: "Registration opened",
      time: "2 days ago",
      type: "system" as const,
    },
    { text: "Edify announced", time: "1 week ago", type: "system" as const },
  ];

  return (
    <Flex flexGrow="1" direction="column">
      {/* Top bar */}
      <Flex
        justify="between"
        align="center"
        px="6"
        py="4"
        className="animate-fade-up delay-1 border-b border-border"
      >
        <Text
          size="2"
          weight="medium"
          className="tracking-[0.1em] uppercase"
        >
          Edify
        </Text>
        <Flex align="center" gap="4">
          <Text size="1" className="text-muted">
            {user?.email}
          </Text>
          <Avatar
            size="2"
            fallback={user?.email?.[0]?.toUpperCase() ?? "U"}
            radius="full"
            variant="solid"
          />
          <form action={signout}>
            <button
              type="submit"
              className="text-muted hover:text-foreground transition-colors flex items-center gap-1 text-xs"
            >
              <ExitIcon />
              Sign out
            </button>
          </form>
        </Flex>
      </Flex>

      {/* Main content */}
      <Box px="6" py="8" mx="auto" width="100%" style={{ maxWidth: 960 }}>
        {/* Welcome */}
        <Flex direction="column" gap="1" className="animate-fade-up delay-2">
          <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">
            Good to see you
          </h1>
          <Text size="3" className="text-muted">
            Here&apos;s your hackathon overview
          </Text>
        </Flex>

        <Separator size="4" my="6" className="animate-fade-up delay-3" />

        {/* Stats grid */}
        <Grid
          columns={{ initial: "2", sm: "4" }}
          gap="4"
          className="animate-fade-up delay-3"
        >
          {stats.map((stat) => (
            <Card key={stat.label} variant="surface">
              <Flex direction="column" gap="3" p="1">
                <Flex justify="between" align="center">
                  <Text
                    size="1"
                    className="text-muted uppercase tracking-[0.1em]"
                  >
                    {stat.label}
                  </Text>
                  <stat.icon
                    className="text-muted"
                    width={14}
                    height={14}
                  />
                </Flex>
                <Text size="7" weight="bold" className="tracking-tight">
                  {stat.value}
                </Text>
              </Flex>
            </Card>
          ))}
        </Grid>

        {/* Activity section */}
        <Flex
          direction="column"
          gap="4"
          mt="8"
          className="animate-fade-up delay-4"
        >
          <Text
            size="1"
            weight="medium"
            className="text-muted uppercase tracking-[0.1em]"
          >
            Recent Activity
          </Text>
          <Card variant="surface">
            <Flex direction="column">
              {activity.map((item, i) => (
                <Flex key={i} direction="column">
                  {i > 0 && <Separator size="4" />}
                  <Flex justify="between" align="center" py="3" px="1">
                    <Flex align="center" gap="3">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted shrink-0" />
                      <Text size="2">{item.text}</Text>
                    </Flex>
                    <Flex align="center" gap="3" flexShrink="0">
                      <Badge
                        size="1"
                        variant="soft"
                        color={item.type === "join" ? "ruby" : "gray"}
                      >
                        {item.type === "join" ? "You" : "System"}
                      </Badge>
                      <Text size="1" className="text-muted whitespace-nowrap">
                        {item.time}
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>
              ))}
            </Flex>
          </Card>
        </Flex>

        {/* Quick actions */}
        <Grid
          columns={{ initial: "1", sm: "2" }}
          gap="4"
          mt="8"
          className="animate-fade-up delay-5"
        >
          <Card
            variant="surface"
            className="cursor-pointer hover:bg-surface transition-colors"
          >
            <Flex direction="column" gap="2" p="1">
              <Text size="2" weight="medium">
                Create a project
              </Text>
              <Text size="2" className="text-muted">
                Start building something new for the hackathon
              </Text>
            </Flex>
          </Card>
          <Card
            variant="surface"
            className="cursor-pointer hover:bg-surface transition-colors"
          >
            <Flex direction="column" gap="2" p="1">
              <Text size="2" weight="medium">
                Find teammates
              </Text>
              <Text size="2" className="text-muted">
                Browse participants and form your team
              </Text>
            </Flex>
          </Card>
        </Grid>
      </Box>
    </Flex>
  );
}
