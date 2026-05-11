import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const WEBHOOK_URL =
  "https://backend.fenil.com.br/webhook-forms/receive/b1e48cc898f8ea5eca135c717c1145582d46fa28caae675772fcb4c27909dc43";
const N8N_WEBHOOK_URL =
  "https://n8n.fenil.com.br/webhook/54bd019c-9d96-48d3-988a-f23d263d1d03";

const formSchema = z.object({
  restaurante: z.string().min(1, "Selecione uma opção"),
  delivery: z.string().min(1, "Selecione uma opção"),
  nome: z.string().trim().min(1, "Nome é obrigatório").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  celular: z.string().trim().min(10, "Celular inválido").max(20),
  captcha: z.string().min(1, "Resposta obrigatória"),
  consentimento: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface HeroFormProps {
  heroTitle?: string;
  heroSubtitle?: string;
  gradientStyle?: string;
  cardColor?: string;
}

const HeroForm = ({
  heroTitle = "Preencha o formulário, simule o seu pedido em uma pizzaria e veja como é ser atendido pelo nosso Copiloto de Vendas",
  heroSubtitle = "Descubra porque somos a nova geração de chatbot",
}: HeroFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      restaurante: "",
      delivery: "",
      nome: "",
      email: "",
      celular: "",
      captcha: "",
      consentimento: false,
    },
  });

  const onSubmit = async (data: FormData) => {
    if (data.captcha !== "11") {
      setError("captcha", { message: "Resposta incorreta" });
      return;
    }
    if (!data.consentimento) {
      setError("consentimento", { message: "Você precisa aceitar para continuar" });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = JSON.stringify({
        nome: data.nome,
        email: data.email,
        celular: "55" + data.celular.replace(/\D/g, ""),
        gerencia_restaurante: data.restaurante === "sim" ? "Sim" : "Não",
        trabalha_delivery: data.delivery === "sim" ? "Sim" : "Não",
      });
      await fetch(WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: payload });
      fetch(N8N_WEBHOOK_URL, { method: "POST", mode: "no-cors", body: payload }).catch(() => {});
      toast.success("Formulário enviado com sucesso! Entraremos em contato.");
      setSubmitted(true);
    } catch {
      toast.error("Erro ao enviar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className="w-full py-12 md:py-20"
      style={{
        background: "linear-gradient(135deg, hsl(330, 85%, 45%), hsl(280, 70%, 40%))",
      }}
    >
      <div className="container mx-auto grid gap-10 px-4 md:grid-cols-2 md:items-center md:gap-16">
        {/* Left side */}
        <div className="text-center md:text-left">
          <h1 className="mb-6 text-3xl font-extrabold leading-tight text-white md:text-4xl lg:text-5xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {heroTitle}
          </h1>
          <p className="text-lg font-medium text-white/90 md:text-xl">
            {heroSubtitle}
          </p>
        </div>

        {/* Right side - Form card */}
        <Card className="border-0 shadow-2xl" style={{ background: "hsl(38, 95%, 55%)" }}>
          <CardContent className="p-6 md:p-8">
            {submitted ? (
              <div className="rounded-2xl bg-white p-10 text-center">
                <CheckCircle2 className="mx-auto mb-4 size-14 text-purple-600" />
                <h3 className="mb-2 text-2xl font-extrabold text-gray-900">
                  Obrigado!
                </h3>
                <p className="text-gray-500">
                  Recebemos seu cadastro. Em breve nosso time entrará em contato para liberar seu teste do Copiloto.
                </p>
              </div>
            ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Select restaurante */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">
                  Trabalha, gerencia ou é dono de uma operação de restaurante?
                </Label>
                <Select onValueChange={(v) => setValue("restaurante", v)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sim">Sim</SelectItem>
                    <SelectItem value="nao">Não</SelectItem>
                  </SelectContent>
                </Select>
                {errors.restaurante && <p className="text-xs font-medium text-destructive">{errors.restaurante.message}</p>}
              </div>

              {/* Radio delivery */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Trabalha com delivery?</Label>
                <RadioGroup onValueChange={(v) => setValue("delivery", v)} className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="sim" id="delivery-sim" />
                    <Label htmlFor="delivery-sim" className="text-foreground">Sim</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="nao" id="delivery-nao" />
                    <Label htmlFor="delivery-nao" className="text-foreground">Não</Label>
                  </div>
                </RadioGroup>
                {errors.delivery && <p className="text-xs font-medium text-destructive">{errors.delivery.message}</p>}
              </div>

              {/* Nome */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Nome</Label>
                <Input {...register("nome")} placeholder="Seu nome completo" className="bg-background" />
                {errors.nome && <p className="text-xs font-medium text-destructive">{errors.nome.message}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Email</Label>
                <Input {...register("email")} type="email" placeholder="seu@email.com" className="bg-background" />
                {errors.email && <p className="text-xs font-medium text-destructive">{errors.email.message}</p>}
              </div>

              {/* Celular */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Celular</Label>
                <div className="flex gap-2">
                  <span className="flex h-10 items-center rounded-md border border-input bg-background px-3 text-sm">
                    🇧🇷 +55
                  </span>
                  <Input {...register("celular")} placeholder="(00) 00000-0000" className="bg-background" />
                </div>
                {errors.celular && <p className="text-xs font-medium text-destructive">{errors.celular.message}</p>}
              </div>

              {/* Captcha */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Quanto é 10 + 1?</Label>
                <Input {...register("captcha")} placeholder="Sua resposta" className="bg-background" />
                {errors.captcha && <p className="text-xs font-medium text-destructive">{errors.captcha.message}</p>}
              </div>

              {/* Checkbox consentimento */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="consentimento"
                  onCheckedChange={(checked) => setValue("consentimento", checked === true)}
                  className="mt-1"
                />
                <Label htmlFor="consentimento" className="text-xs leading-relaxed text-foreground">
                  Ao informar meus dados, eu concordo com a{" "}
                  <a href="#" className="underline font-semibold">Política de Privacidade</a> e com os{" "}
                  <a href="#" className="underline font-semibold">Termos de Uso</a>. Aceito receber comunicações da NaturalBot.
                </Label>
              </div>
              {errors.consentimento && <p className="text-xs font-medium text-destructive">{errors.consentimento.message}</p>}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-primary-foreground py-6 text-lg font-bold hover:bg-primary/90"
              >
                {isSubmitting ? "ENVIANDO..." : "TESTAR COPILOTO"}
              </Button>
            </form>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default HeroForm;
