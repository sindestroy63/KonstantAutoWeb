"use client";

import { useState } from "react";
import { ArrowRight, SlidersHorizontal } from "lucide-react";
import {
  Button,
  ButtonLink,
  Checkbox,
  Cluster,
  Container,
  DesignSystemProvider,
  Dialog,
  Eyebrow,
  Heading,
  IconButton,
  InlineAlert,
  ResponsiveGrid,
  ResponsiveImage,
  Section,
  SegmentedControl,
  SelectField,
  Stack,
  StatusBadge,
  Text,
  TextField,
} from "@/components/ui-v2";

type Intent = "selection" | "consultation";

export function ComponentExamples() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [intent, setIntent] = useState<Intent>("selection");

  return (
    <DesignSystemProvider>
      <Section tone="canvas" aria-labelledby="ui-v2-example-title">
        <Container>
          <Stack gap={8}>
            <Stack gap={3}>
              <Eyebrow>Design System V2</Eyebrow>
              <Heading id="ui-v2-example-title" as="h1" variant="h2">Компоненты для поэтапной миграции</Heading>
              <Text tone="muted">Этот showcase компилируется вместе с проектом, но не подключен ни к одному production route.</Text>
            </Stack>

            <Cluster gap={3}>
              <Button onClick={() => setDialogOpen(true)}>Открыть диалог</Button>
              <ButtonLink href="#component-example" variant="secondary">Посмотреть пример <ArrowRight aria-hidden="true" /></ButtonLink>
              <IconButton label="Открыть фильтры" icon={<SlidersHorizontal aria-hidden="true" />} />
              <StatusBadge tone="success">Проверено</StatusBadge>
            </Cluster>

            <ResponsiveGrid minItemWidth="standard">
              <Stack gap={4}>
                <TextField label="Имя" autoComplete="name" placeholder="Как к вам обращаться" required />
                <SelectField label="Тип автомобиля" defaultValue="">
                  <option value="" disabled>Выберите кузов</option>
                  <option value="sedan">Седан</option>
                  <option value="suv">Кроссовер</option>
                </SelectField>
                <Checkbox label="Согласен на обработку персональных данных" />
              </Stack>
              <Stack gap={4}>
                <SegmentedControl<Intent>
                  label="Тип обращения"
                  value={intent}
                  options={[
                    { value: "selection", label: "Подбор" },
                    { value: "consultation", label: "Консультация" },
                  ]}
                  onChange={setIntent}
                />
                <InlineAlert tone="info" title="Контракт сохранен">UI-компоненты не определяют API или бизнес-логику формы.</InlineAlert>
                <ResponsiveImage src="/images/catalog/toyota-camry.webp" alt="Toyota Camry" sizes="(max-width: 48rem) 100vw, 50vw" fit="contain" rounded />
              </Stack>
            </ResponsiveGrid>
          </Stack>
        </Container>
      </Section>

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Пример доступного диалога"
        description="Focus trap, Escape, возврат фокуса и scroll lock входят в primitive."
        closeLabel="Закрыть диалог"
        footer={<Cluster justify="end"><Button variant="secondary" onClick={() => setDialogOpen(false)}>Закрыть</Button><Button>Продолжить</Button></Cluster>}
      >
        <Text>Бизнес-состояние передается снаружи и остается ответственностью существующего feature-компонента.</Text>
      </Dialog>
    </DesignSystemProvider>
  );
}
