#!/usr/bin/env python3
"""
Generate ultra-accurate nautical diagram PNGs for COLREGs 2018 / RIPEAM-72
Rules:
- Starboard (Boreste / BE) = GREEN (#10B981)
- Port (Bombordo / BB) = RED (#EF4444)
- Sternlight / Masthead = WHITE (#F8FAFC)
- Clean, dark tactical display (#090D16 / #0F172A)
"""
import math
from PIL import Image, ImageDraw, ImageFont

W, H = 800, 600

def get_font(size, bold=False):
    # Try system fonts on macOS
    font_paths = [
        "/System/Library/Fonts/SFNS.ttf",
        "/System/Library/Fonts/SFCompact.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/Geneva.dfont",
        "/System/Library/Fonts/Supplemental/Arial.ttf"
    ]
    for fp in font_paths:
        try:
            return ImageFont.truetype(fp, size)
        except Exception:
            continue
    return ImageFont.load_default()

def draw_vessel(draw, x, y, angle_deg, length=60, width=22, hull_color="#1E293B", stroke_color="#64748B"):
    """Draw a ship hull polygon oriented at angle_deg (0 = pointing UP) with sidelights"""
    rad = math.radians(angle_deg)
    cos_a = math.cos(rad)
    sin_a = math.sin(rad)

    def rot(dx, dy):
        rx = dx * cos_a - dy * sin_a
        ry = dx * sin_a + dy * cos_a
        return (x + rx, y + ry)

    hw = width / 2
    hl = length / 2
    bow_ext = length * 0.35

    # Hull points: bow, starboard forward, starboard aft, transom center, port aft, port forward
    pts = [
        rot(0, -hl - bow_ext),
        rot(hw, -hl * 0.4),
        rot(hw, hl),
        rot(0, hl * 0.9),
        rot(-hw, hl),
        rot(-hw, -hl * 0.4)
    ]
    draw.polygon(pts, fill=hull_color, outline=stroke_color)

    # Starboard sidelight (Green) on right side of hull
    sb_pos = rot(hw, -hl * 0.4)
    draw.ellipse([sb_pos[0]-5, sb_pos[1]-5, sb_pos[0]+5, sb_pos[1]+5], fill="#10B981", outline="#FFFFFF")

    # Port sidelight (Red) on left side of hull
    port_pos = rot(-hw, -hl * 0.4)
    draw.ellipse([port_pos[0]-5, port_pos[1]-5, port_pos[0]+5, port_pos[1]+5], fill="#EF4444", outline="#FFFFFF")

    # Masthead light (White)
    mh_pos = rot(0, -hl * 0.2)
    draw.ellipse([mh_pos[0]-4, mh_pos[1]-4, mh_pos[0]+4, mh_pos[1]+4], fill="#F8FAFC", outline="#94A3B8")

# ==========================================
# 1. RULE 14: HEAD-ON SITUATION
# ==========================================
def make_rule14():
    im = Image.new("RGBA", (W, H), "#090D16")
    draw = ImageDraw.Draw(im)

    f_title = get_font(24, bold=True)
    f_sub = get_font(16)
    f_body = get_font(14)
    f_small = get_font(12)

    # Frame & Title
    draw.rectangle([10, 10, W-10, H-10], outline="#1E293B", width=2)
    draw.text((W/2, 35), "COLREG RULE 14 • HEAD-ON SITUATION", fill="#F8FAFC", font=f_title, anchor="mm")
    draw.text((W/2, 65), "RIPEAM REGRA 14 • SITUAÇÃO DE RODA A RODA", fill="#94A3B8", font=f_sub, anchor="mm")
    draw.line([30, 85, W-30, 85], fill="#334155", width=1)

    # Meeting reciprocal courses
    # Vessel 1 (heading 000° UP)
    v1_x, v1_y = 400, 440
    # Vessel 2 (heading 180° DOWN)
    v2_x, v2_y = 400, 190

    # Reciprocal course dashed line
    for y_step in range(160, 480, 20):
        draw.line([400, y_step, 400, y_step+10], fill="#475569", width=2)

    # Draw vessels
    draw_vessel(draw, v1_x, v1_y, 0, length=70, width=26)
    draw_vessel(draw, v2_x, v2_y, 180, length=70, width=26)

    # Labels for vessels
    draw.text((320, 440), "Navio A\n(Propulsão)", fill="#F8FAFC", font=f_body, anchor="rm")
    draw.text((320, 190), "Navio B\n(Propulsão)", fill="#F8FAFC", font=f_body, anchor="rm")

    # Alter course to Starboard arcs/arrows
    # For Navio A: alters to Starboard (East / Right)
    draw.arc([400, 360, 520, 460], start=270, end=360, fill="#10B981", width=4)
    draw.polygon([(460, 355), (475, 360), (460, 365)], fill="#10B981")
    draw.text((540, 410), "Guina para BORESTE (BE)\nPassa Bombordo com Bombordo\nApito: 1 curto (•)", fill="#10B981", font=f_body, anchor="lm")

    # For Navio B: alters to Starboard (West / Left from its perspective, which is screen right)
    draw.arc([280, 170, 400, 270], start=90, end=180, fill="#10B981", width=4)
    draw.polygon([(340, 275), (325, 270), (340, 265)], fill="#10B981")
    draw.text((260, 220), "Guina para BORESTE (BE)\nPassa Bombordo com Bombordo\nApito: 1 curto (•)", fill="#10B981", font=f_body, anchor="rm")

    # Central Box: What each sees at night
    draw.rectangle([210, 265, 590, 345], fill="#0F172A", outline="#38BDF8", width=2)
    draw.text((400, 285), "VISÃO NOTURNA: LUZES DE MASTRO EM LINHA", fill="#F8FAFC", font=f_body, anchor="mm")
    draw.text((400, 308), "Ambos avistam simultaneamente: BB (Vermelha) E BE (Verde)", fill="#E2E8F0", font=f_small, anchor="mm")
    draw.text((400, 328), "Regra 14(c): Na dúvida, presuma que a situação existe e manobre!", fill="#FACC15", font=f_small, anchor="mm")

    # Footer note with verbatim text excerpt
    draw.rectangle([20, 510, W-20, 580], fill="#020617", outline="#1E293B")
    draw.text((400, 532), "TRECHO LITERAL • IMO COLREG 2018 RULE 14(a):", fill="#38BDF8", font=f_small, anchor="mm")
    draw.text((400, 555), '"...each shall alter her course to starboard so that each shall pass on the port side of the other."', fill="#F1F5F9", font=f_body, anchor="mm")

    im.save("public/content/posts/media/colregs-rule14-headon.png")
    print("Rule 14 PNG generated.")

# ==========================================
# 2. RULE 15/16/17: CROSSING SITUATION
# ==========================================
def make_rule15():
    im = Image.new("RGBA", (W, H), "#090D16")
    draw = ImageDraw.Draw(im)

    f_title = get_font(24, bold=True)
    f_sub = get_font(16)
    f_body = get_font(14)
    f_small = get_font(12)

    # Frame & Title
    draw.rectangle([10, 10, W-10, H-10], outline="#1E293B", width=2)
    draw.text((W/2, 35), "COLREG RULE 15, 16 & 17 • CROSSING SITUATION", fill="#F8FAFC", font=f_title, anchor="mm")
    draw.text((W/2, 65), "RIPEAM REGRA 15 • SITUAÇÃO DE RUMOS CRUZADOS", fill="#94A3B8", font=f_sub, anchor="mm")
    draw.line([30, 85, W-30, 85], fill="#334155", width=1)

    # Vessel A (Give-way / Obrigada) heading UP 000°
    va_x, va_y = 280, 410
    # Vessel B (Stand-on / Preferencial) heading WEST 270° crossing from starboard
    vb_x, vb_y = 620, 250

    # Draw courses
    # A course dashed line ahead
    draw.line([va_x, va_y-40, va_x, 150], fill="#64748B", width=2)
    # B course dashed line ahead
    draw.line([vb_x-40, vb_y, 160, vb_y], fill="#64748B", width=2)

    # Collision point
    draw.ellipse([va_x-8, vb_y-8, va_x+8, vb_y+8], fill="#EF4444", outline="#F8FAFC")
    draw.text((va_x+15, vb_y-15), "Ponto de Colisão\n(Se ninguém manobrar)", fill="#EF4444", font=f_small, anchor="lb")

    # Draw vessels
    draw_vessel(draw, va_x, va_y, 0, length=70, width=26)
    draw_vessel(draw, vb_x, vb_y, 270, length=70, width=26)

    # Labels for Navio A (Give-way)
    draw.rectangle([40, 370, 220, 460], fill="#18181B", outline="#EF4444", width=2)
    draw.text((130, 390), "NAVIO A (OBRIGADO)", fill="#EF4444", font=f_body, anchor="mm")
    draw.text((130, 410), "GIVE-WAY VESSEL", fill="#F87171", font=f_small, anchor="mm")
    draw.text((130, 435), "Vê Navio B por BORESTE\n(Avista luz Vermelha de B)", fill="#CBD5E1", font=f_small, anchor="mm")

    # Action for Navio A: turn starboard, pass under stern of B
    draw.arc([va_x, 320, 520, 440], start=270, end=360, fill="#10B981", width=4)
    draw.line([520, 380, 520, 290], fill="#10B981", width=4)
    draw.arc([420, 200, 520, 290], start=0, end=90, fill="#10B981", width=4)
    draw.polygon([(425, 205), (410, 200), (425, 195)], fill="#10B981")
    draw.text((450, 460), "Manobra Obrigatória de A:\nGuinar para Boreste e passar pela POPA de B\n(Evitar cruzar pela proa!)", fill="#10B981", font=f_body, anchor="lm")

    # Labels for Navio B (Stand-on)
    draw.rectangle([520, 110, 750, 200], fill="#18181B", outline="#10B981", width=2)
    draw.text((635, 130), "NAVIO B (PREFERENCIAL)", fill="#10B981", font=f_body, anchor="mm")
    draw.text((635, 150), "STAND-ON VESSEL", fill="#34D399", font=f_small, anchor="mm")
    draw.text((635, 175), "Vê Navio A por BOMBORDO\n(Avista luz Verde de A)", fill="#CBD5E1", font=f_small, anchor="mm")

    # Critical Trap: Rule 17(c)
    draw.rectangle([40, 220, 220, 310], fill="#1E1B4B", outline="#6366F1", width=1.5)
    draw.text((130, 240), "⚠️ ATENÇÃO REGRA 17(c)", fill="#FACC15", font=f_body, anchor="mm")
    draw.text((130, 270), "Se B tiver que manobrar,\nNÃO deve guinar para BB\npara navio a seu bombordo!", fill="#E0E7FF", font=f_small, anchor="mm")

    # Footer note with verbatim text excerpt
    draw.rectangle([20, 510, W-20, 580], fill="#020617", outline="#1E293B")
    draw.text((400, 532), "TRECHO LITERAL • IMO COLREG 2018 RULE 15:", fill="#38BDF8", font=f_small, anchor="mm")
    draw.text((400, 555), '"...the vessel which has the other on her own starboard side shall keep out of the way and shall... avoid crossing ahead"', fill="#F1F5F9", font=f_body, anchor="mm")

    im.save("public/content/posts/media/colregs-rule15-crossing.png")
    print("Rule 15 PNG generated.")

# ==========================================
# 3. RULE 13: OVERTAKING
# ==========================================
def make_rule13():
    im = Image.new("RGBA", (W, H), "#090D16")
    draw = ImageDraw.Draw(im)

    f_title = get_font(24, bold=True)
    f_sub = get_font(16)
    f_body = get_font(14)
    f_small = get_font(12)

    # Frame & Title
    draw.rectangle([10, 10, W-10, H-10], outline="#1E293B", width=2)
    draw.text((W/2, 35), "COLREG RULE 13 • OVERTAKING", fill="#F8FAFC", font=f_title, anchor="mm")
    draw.text((W/2, 65), "RIPEAM REGRA 13 • EMBARCAÇÃO ALCANÇANDO (ULTRAPASSAGEM)", fill="#94A3B8", font=f_sub, anchor="mm")
    draw.line([30, 85, W-30, 85], fill="#334155", width=1)

    # Center vessel being overtaken
    vx, vy = 400, 240
    draw_vessel(draw, vx, vy, 0, length=80, width=28)
    draw.text((vx, vy-55), "NAVIO ALCANÇADO (Stand-on)", fill="#F8FAFC", font=f_body, anchor="mm")

    # Beam line (Traves)
    draw.line([150, vy, 650, vy], fill="#475569", width=1)
    draw.text((160, vy-12), "Linha do Través (90° BB)", fill="#94A3B8", font=f_small)
    draw.text((640, vy-12), "Linha do Través (90° BE)", fill="#94A3B8", font=f_small, anchor="ra")

    # Sector of Overtaking: > 22.5° abaft the beam (Sector from 112.5° to 247.5° = arc of 135° sternlight)
    # Draw arc representing Sternlight (White)
    draw.pieslice([vx-180, vy-180, vx+180, vy+180], start=22.5+90, end=180-22.5+90, fill="#1E293B", outline="#F8FAFC")
    draw.text((vx, vy+120), "SETOR DE ULTRAPASSAGEM\n(Arco de 135° da Luz de Alcançado)", fill="#F8FAFC", font=f_body, anchor="mm")
    draw.text((vx, vy+155), "Mais de 22,5° (2 quartas) para ré do través\nÀ noite: AVISTA APENAS A LUZ DE ALCANÇADO (Branca)\nNÃO vê nenhuma das luzes de bordo (nem BB nem BE)", fill="#93C5FD", font=f_small, anchor="mm")

    # Overtaking vessel approaching
    ov_x, ov_y = 520, 440
    draw_vessel(draw, ov_x, ov_y, 345, length=65, width=24)
    draw.text((ov_x+20, ov_y), "NAVIO ALCANÇADOR\n(Give-way Vessel)\nDEVER ABSOLUTO DE MANOBRAR", fill="#FACC15", font=f_body, anchor="lm")

    # Arrow showing keeping clear
    draw.arc([ov_x-60, ov_y-160, ov_x+60, ov_y], start=180, end=270, fill="#10B981", width=3)
    draw.polygon([(ov_x-65, ov_y-100), (ov_x-60, ov_y-115), (ov_x-55, ov_y-100)], fill="#10B981")

    # Trap rule box: Rule 13(d)
    draw.rectangle([40, 370, 290, 480], fill="#0F172A", outline="#F43F5E", width=1.5)
    draw.text((165, 390), "⚠️ REGRA DE OURO • 13(d)", fill="#F43F5E", font=f_body, anchor="mm")
    draw.text((165, 415), '"Uma vez alcançador, sempre alcançador"', fill="#FDE047", font=f_small, anchor="mm")
    draw.text((165, 445), "Nenhuma alteração posterior de\nmarcação transforma o alcançador\nem rumo cruzado!", fill="#CBD5E1", font=f_small, anchor="mm")

    # Footer note with verbatim text excerpt
    draw.rectangle([20, 510, W-20, 580], fill="#020617", outline="#1E293B")
    draw.text((400, 532), "TRECHO LITERAL • IMO COLREG 2018 RULE 13(b):", fill="#38BDF8", font=f_small, anchor="mm")
    draw.text((400, 555), '"...coming up with another vessel from a direction more than 22.5 degrees abaft her beam... able to see only the sternlight..."', fill="#F1F5F9", font=f_body, anchor="mm")

    im.save("public/content/posts/media/colregs-rule13-overtaking.png")
    print("Rule 13 PNG generated.")

# ==========================================
# 4. RULE 18: HIERARCHY OF RESPONSIBILITY
# ==========================================
def make_rule18():
    im = Image.new("RGBA", (W, H), "#090D16")
    draw = ImageDraw.Draw(im)

    f_title = get_font(24, bold=True)
    f_sub = get_font(16)
    f_body = get_font(14)
    f_small = get_font(12)

    # Frame & Title
    draw.rectangle([10, 10, W-10, H-10], outline="#1E293B", width=2)
    draw.text((W/2, 35), "COLREG RULE 18 • HIERARCHY OF RESPONSIBILITY", fill="#F8FAFC", font=f_title, anchor="mm")
    draw.text((W/2, 65), "RIPEAM REGRA 18 • RESPONSABILIDADES ENTRE EMBARCAÇÕES", fill="#94A3B8", font=f_sub, anchor="mm")
    draw.line([30, 85, W-30, 85], fill="#334155", width=1)

    # Hierarchy ladder: from top (highest priority / most privileged) to bottom (lowest / keeps out of way of everyone above)
    items = [
        ("1. NUC (Sem Governo)", "Not Under Command • Regra 27(a)", "#EF4444", "Luzes: 2 Vermelhas 360° | Dia: 2 Esferas"),
        ("2. RAM (Manobra Restrita)", "Restricted in Ability to Manoeuvre • Regra 27(b)", "#F97316", "Luzes: Vermelha-Branca-Vermelha | Dia: Esfera-Losango-Esfera"),
        ("3. CBD (Calado Restrito)*", "Constrained by Draught • Regra 28", "#FBBF24", "Não impedirá a passagem segura de CBD (evitar cruzar a proa)"),
        ("4. Pesca (Fishing)", "Engaged in Fishing (Redes ou Arrasto) • Regra 26", "#38BDF8", "Luzes: Verde/Branca (Arrasto) ou Vermelha/Branca (Outras)"),
        ("5. Vela (Sailing)", "Sailing Vessel Underway • Regra 25", "#A855F7", "Luzes de bordo + alcançado (ou tricolor no tope)"),
        ("6. Propulsão Mecânica", "Power-driven Vessel • Regra 23", "#10B981", "Deve manobrar para TODAS as categorias acima (1 a 5)"),
        ("7. Hidroavião & WIG", "Seaplane & WIG craft on water", "#64748B", "Devem manter-se afastados de todas as embarcações")
    ]

    top_y = 100
    row_h = 50
    for idx, (title, desc, color, lights) in enumerate(items):
        y = top_y + idx * row_h
        # Priority Badge
        draw.rectangle([40, y, 760, y+42], fill="#0F172A", outline=color, width=1.5)
        draw.text((55, y+21), title, fill=color, font=f_body, anchor="lm")
        draw.text((320, y+21), desc, fill="#E2E8F0", font=f_small, anchor="lm")
        draw.text((745, y+21), lights, fill="#94A3B8", font=f_small, anchor="rm")

    # Important exam note on Rule 18 exceptions
    draw.rectangle([40, 465, 760, 505], fill="#1E1B4B", outline="#4338CA")
    draw.text((400, 485), "⚠️ EXCEÇÃO DA REGRA 18: 'Exceto onde as Regras 9, 10 e 13 exijam em contrário' (Ex: Ultrapassagem se sobrepõe!)", fill="#FDE047", font=f_small, anchor="mm")

    # Footer note with verbatim text excerpt
    draw.rectangle([20, 515, W-20, 580], fill="#020617", outline="#1E293B")
    draw.text((400, 535), "TRECHO LITERAL • IMO COLREG 2018 RULE 18:", fill="#38BDF8", font=f_small, anchor="mm")
    draw.text((400, 558), '"Except where Rules 9, 10 and 13 otherwise require... A power-driven vessel underway shall keep out of the way of..."', fill="#F1F5F9", font=f_body, anchor="mm")

    im.save("public/content/posts/media/colregs-rule18-hierarchy.png")
    print("Rule 18 PNG generated.")

if __name__ == "__main__":
    make_rule14()
    make_rule15()
    make_rule13()
    make_rule18()
